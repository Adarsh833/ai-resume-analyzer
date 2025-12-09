import {Link, useParams, useNavigate} from "react-router";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";
import Summary from "~/components/Summary";
import Details from "~/components/Details";
import ATS from "~/components/ATS";


export const meta = () => [
    { title: 'Resumind | Review' },
    { name: 'description', content: 'Detailed overview of your resume.' },
];

const generateCoverLetterPrompt = ({ jobTitle, jobDescription }: { jobTitle: string, jobDescription: string }) => {
    return `
    You are an expert career counselor. Your task is to write a professional and highly effective cover letter for a job applicant.
    
    The cover letter should be generated based on the following information:
    - The applicant's resume (provided as a PDF file).
    - The job they are applying for.

    Instructions:
    1.  **Analyze the Resume**: Identify the applicant's key skills, experiences, and accomplishments from the resume.
    2.  **Analyze the Job Description**: Extract the required qualifications, responsibilities, and company values from the job description.
    3.  **Write the Cover Letter**:
        -  The letter should be professional and polite.
        -  It must be directly relevant to the specific job title and company.
        -  The body of the letter should explicitly connect the applicant's experience and skills from the resume to the requirements of the job description.
        -  Ensure the tone is confident and persuasive.
        -  The cover letter must be provided as plain text, without any additional notes or conversation.
        
    Job Title: ${jobTitle}
    Job Description: ${jobDescription}
    `;
};

const Resume=()=>{
    const {id} = useParams();
    const {auth, isLoading, fs, kv, ai} = usePuterStore(); // Added 'ai' here
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const navigate = useNavigate();

    // New state variables for the cover letter feature
    const [coverLetter, setCoverLetter] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading]);

    useEffect(() => {
        const loadResume=async()=>{
            const resume=await kv.get(`resume:${id}`);

            if(!resume) return;

            const data=JSON.parse(resume);
            const resumeBlob=await fs.read(data.resumePath);
            if(!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob],{type: "application/pdf"});
            const resumeUrl=URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl);

            const imageBlob=await fs.read(data.imagePath);
            if(!imageBlob) return;
            const imageUrl=URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);

            setFeedback(data.feedback);
        }
        loadResume();
    }, [id]);

    // New function to generate the cover letter
    const generateCoverLetter = async () => {
        setIsGenerating(true);
        setCoverLetter(null); // Clear previous letter

        const resumeData = await kv.get(`resume:${id}`);
        if (!resumeData) return;
        const data = JSON.parse(resumeData);

        const prompt = generateCoverLetterPrompt({
            jobTitle: data.jobTitle,
            jobDescription: data.jobDescription,
        });

        const aiResponse = await ai.chat(
            [
                {
                    role: "user",
                    content: [
                        { type: "file", puter_path: data.resumePath },
                        { type: "text", text: prompt },
                    ],
                },
            ],
            { model: "gpt-4o-mini" }
        );

        if (aiResponse && aiResponse.message.content) {
            const textContent = typeof aiResponse.message.content === 'string'
                ? aiResponse.message.content
                : aiResponse.message.content[0].text;
            setCoverLetter(textContent);
        }

        setIsGenerating(false);
    };

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>
            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section bg-[url('/images/bg-small.svg') bg-cpver h-[100vh] sticky top-0 items-center justify-center">
                    {imageUrl && resumeUrl && (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer noreferrer">
                                <img src={imageUrl}
                                     className="w-full h-full object-contain rounded-2xl"
                                     title="resume"
                                />
                            </a>
                        </div>
                    )}
                </section>

                <section className="feedback-section">
                    <h2 className="text-4xl text-black font-bold">Resume Review</h2>
                    {feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []}/>
                            <Details feedback={feedback}/>

                            {/* New section for cover letter generator */}
                            <div className="flex flex-col gap-4">
                                <button
                                    className="primary-button"
                                    onClick={generateCoverLetter}
                                    disabled={isGenerating}
                                >
                                    {isGenerating ? "Generating..." : "Generate Cover Letter"}
                                </button>

                                {coverLetter && (
                                    <div className="bg-white rounded-2xl p-6 shadow-md animate-in fade-in duration-500">
                                        <h3 className="text-xl font-semibold mb-4">Generated Cover Letter</h3>
                                        <textarea
                                            className="w-full h-96 p-4 rounded-lg border border-gray-200 text-gray-700"
                                            readOnly
                                            value={coverLetter}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ):(
                        <img src="/images/resume-scan-2.gif" className="w-full"/>
                    )}
                </section>
            </div>
        </main>
    )
}

export default Resume;