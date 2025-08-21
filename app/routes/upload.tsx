// import {type FormEvent, useState} from 'react'
// import Navbar from "~/components/Navbar";
// import FileUploader from "~/components/FileUploader";
// import {usePuterStore} from "~/lib/puter";
// import {useNavigate} from "react-router";
// import {convertPdfToImage} from "~/lib/pdf2img";
// import {generateUUID} from "~/lib/utils";
// import {prepareInstructions} from "../../constants";
//
// const Upload = () => {
//     const { auth, isLoading, fs, ai, kv } = usePuterStore();
//     const navigate = useNavigate();
//     const [isProcessing, setIsProcessing] = useState(false);
//     const [statusText, setStatusText] = useState('');
//     const [file, setFile] = useState<File | null>(null);
//
//     const handleFileSelect = (file: File | null) => {
//         setFile(file)
//     }
//
//     const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File  }) => {
//         setIsProcessing(true);
//
//         setStatusText('Uploading the file...');
//         const uploadedFile = await fs.upload([file]);
//         if(!uploadedFile) return setStatusText('Error: Failed to upload file');
//
//         setStatusText('Converting to image...');
//         const imageFile = await convertPdfToImage(file);
//         if(!imageFile.file) return setStatusText('Error: Failed to convert PDF to image');
//
//         setStatusText('Uploading the image...');
//         const uploadedImage = await fs.upload([imageFile.file]);
//         if(!uploadedImage) return setStatusText('Error: Failed to upload image');
//
//         setStatusText('Preparing data...');
//         const uuid = generateUUID();
//         const data = {
//             id: uuid,
//             resumePath: uploadedFile.path,
//             imagePath: uploadedImage.path,
//             companyName, jobTitle, jobDescription,
//             feedback: '',
//         }
//         await kv.set(`resume:${uuid}`, JSON.stringify(data));
//
//         setStatusText('Analyzing...');
//
//         const feedback = await ai.feedback(
//             uploadedFile.path,
//             prepareInstructions({ jobTitle, jobDescription })
//         )
//         if (!feedback) return setStatusText('Error: Failed to analyze resume');
//
//         const feedbackText = typeof feedback.message.content === 'string'
//             ? feedback.message.content
//             : feedback.message.content[0].text;
//
//         data.feedback = JSON.parse(feedbackText);
//         await kv.set(`resume:${uuid}`, JSON.stringify(data));
//         setStatusText('Analysis complete, redirecting...');
//         console.log(data);
//         navigate(`/resume/${uuid}`);
//     }
//
//     const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         const form = e.currentTarget.closest('form');
//         if(!form) return;
//         const formData = new FormData(form);
//
//         const companyName = formData.get('company-name') as string;
//         const jobTitle = formData.get('job-title') as string;
//         const jobDescription = formData.get('job-description') as string;
//
//         if(!file) return;
//
//         handleAnalyze({ companyName, jobTitle, jobDescription, file });
//     }
//
//     return (
//         <main className="bg-[url('/images/bg-main.svg')] bg-cover">
//             <Navbar />
//
//             <section className="main-section">
//                 <div className="page-heading py-16">
//                     <h1>Smart feedback for your dream job</h1>
//                     {isProcessing ? (
//                         <>
//                             <h2>{statusText}</h2>
//                             <img src="/images/resume-scan.gif" className="w-1/3" />
//                         </>
//                     ) : (
//                         <h2>Drop your resume for an ATS score and improvement tips</h2>
//                     )}
//                     {!isProcessing && (
//                         <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
//
//                             <div className="form-div">
//                                 <label htmlFor="company-name">Company Name</label>
//                                 <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
//                             </div>
//                             <div className="form-div">
//                                 <label htmlFor="job-title">Job Title</label>
//                                 <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
//                             </div>
//                             <div className="form-div">
//                                 <label htmlFor="job-description">Job Description</label>
//                                 <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
//                             </div>
//
//                             <div className="form-div">
//                                 <label htmlFor="uploader">Upload Resume</label>
//                                 <FileUploader onFileSelect={handleFileSelect} />
//                             </div>
//
//                             <button className="primary-button" type="submit">
//                                 Analyze Resume
//                             </button>
//                         </form>
//                     )}
//                 </div>
//             </section>
//         </main>
//     )
// }
// export default Upload

// ==================================================================================================================
// ==================================================================================================================

// import {type FormEvent, useState} from 'react'
// import Navbar from "~/components/Navbar";
// import FileUploader from "~/components/FileUploader";
// import {usePuterStore} from "~/lib/puter";
// import {useNavigate} from "react-router";
// import {convertPdfToImage} from "~/lib/pdf2img";
// import {generateUUID} from "~/lib/utils";
// import {prepareInstructions} from "../../constants";
//
// const Upload = () => {
//     const { auth, isLoading, fs, ai, kv } = usePuterStore();
//     const navigate = useNavigate();
//     const [isProcessing, setIsProcessing] = useState(false);
//     const [statusText, setStatusText] = useState('');
//     const [file, setFile] = useState<File | null>(null);
//
//     // State variables for job details
//     const [jobUrl, setJobUrl] = useState('');
//     const [companyName, setCompanyName] = useState('');
//     const [jobTitle, setJobTitle] = useState('');
//     const [jobDescription, setJobDescription] = useState('');
//
//     // State variable for error messages
//     const [jobUrlError, setJobUrlError] = useState<string | null>(null);
//
//     const handleFileSelect = (file: File | null) => {
//         setFile(file);
//     };
//
//     const handleAutofill = async (url: string) => {
//         setJobUrlError(null); // Clear previous errors
//
//         if (!url || !url.startsWith('http')) {
//             setJobUrlError('Please enter a valid job URL.');
//             return;
//         }
//
//         setIsProcessing(true);
//         setStatusText('Fetching job details from URL...');
//
//         const prompt = `
//             Please extract the company name, job title, and full job description from the following URL.
//             Provide the output as a JSON object with the keys "companyName", "jobTitle", and "jobDescription".
//             URL: ${url}
//         `;
//
//         try {
//             const aiResponse = await ai.chat(prompt);
//
//             if (aiResponse && aiResponse.message.content) {
//                 const content = aiResponse.message.content;
//                 const textContent = typeof content === 'string' ? content : content[0]?.text;
//
//                 const parsedData = JSON.parse(textContent);
//                 setCompanyName(parsedData.companyName);
//                 setJobTitle(parsedData.jobTitle);
//                 setJobDescription(parsedData.jobDescription);
//                 setStatusText('Job details filled successfully!');
//             } else {
//                 setJobUrlError('Error: Failed to get a valid response from the AI.');
//             }
//         } catch (error) {
//             console.error('AI chat error:', error);
//             if (error instanceof SyntaxError) {
//                 setJobUrlError('Error: AI response had a syntax error. Please check the URL.');
//             } else {
//                 setJobUrlError('Error: Failed to process URL. Please try again.');
//             }
//         } finally {
//             setIsProcessing(false);
//         }
//     };
//
//     const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File  }) => {
//         setIsProcessing(true);
//
//         setStatusText('Uploading the file...');
//         const uploadedFile = await fs.upload([file]);
//         if(!uploadedFile) return setStatusText('Error: Failed to upload file');
//
//         setStatusText('Converting to image...');
//         const imageFile = await convertPdfToImage(file);
//         if(!imageFile.file) return setStatusText('Error: Failed to convert PDF to image');
//
//         setStatusText('Uploading the image...');
//         const uploadedImage = await fs.upload([imageFile.file]);
//         if(!uploadedImage) return setStatusText('Error: Failed to upload image');
//
//         setStatusText('Preparing data...');
//         const uuid = generateUUID();
//         const data = {
//             id: uuid,
//             resumePath: uploadedFile.path,
//             imagePath: uploadedImage.path,
//             companyName, jobTitle, jobDescription,
//             feedback: '',
//         }
//         await kv.set(`resume:${uuid}`, JSON.stringify(data));
//
//         setStatusText('Analyzing...');
//
//         const feedback = await ai.feedback(
//             uploadedFile.path,
//             prepareInstructions({ jobTitle, jobDescription })
//         );
//         if (!feedback) return setStatusText('Error: Failed to analyze resume');
//
//         const feedbackText = typeof feedback.message.content === 'string'
//             ? feedback.message.content
//             : feedback.message.content[0].text;
//
//         try {
//             // Attempt to parse the JSON response from the AI
//             data.feedback = JSON.parse(feedbackText);
//             await kv.set(`resume:${uuid}`, JSON.stringify(data));
//             setStatusText('Analysis complete, redirecting...');
//             console.log(data);
//             navigate(`/resume/${uuid}`);
//         } catch (e) {
//             // Handle JSON parsing errors
//             setStatusText('Error: The AI response was not in the correct format. Please try again.');
//             console.error('JSON Parsing Error:', e);
//         } finally {
//             setIsProcessing(false);
//         }
//     };
//     const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         if(!file) return;
//
//         handleAnalyze({ companyName, jobTitle, jobDescription, file });
//     };
//
//     return (
//         <main className="bg-[url('/images/bg-main.svg')] bg-cover">
//             <Navbar />
//
//             <section className="main-section">
//                 <div className="page-heading py-16">
//                     <h1>Smart feedback for your dream job</h1>
//                     {isProcessing ? (
//                         <>
//                             <h2>{statusText}</h2>
//                             <img src="/images/resume-scan.gif" className="w-1/3" alt="Resume scan" />
//                         </>
//                     ) : (
//                         <h2>Drop your resume for an ATS score and improvement tips</h2>
//                     )}
//                     {!isProcessing && (
//                         <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
//                             <div className="form-div">
//                                 <label htmlFor="job-url">Job URL</label>
//                                 <div className="flex gap-2 w-1/2">
//                                     <input
//                                         type="url"
//                                         name="job-url"
//                                         placeholder="Paste Job URL here"
//                                         id="job-url"
//                                         value={jobUrl}
//                                         onChange={(e) => {
//                                             setJobUrl(e.target.value);
//                                         }}
//                                         onPaste={(e) => {
//                                             const pastedText = e.clipboardData.getData('text');
//                                             setJobUrl(pastedText);
//                                             handleAutofill(pastedText);
//                                         }}
//                                     />
//                                 </div>
//                                 {jobUrlError && (
//                                     <p className="text-red-500 text-sm mt-1">{jobUrlError}</p>
//                                 )}
//                             </div>
//                             <div className="form-div">
//                                 <label htmlFor="company-name">Company Name</label>
//                                 <input
//                                     type="text"
//                                     name="company-name"
//                                     placeholder="Company Name"
//                                     id="company-name"
//                                     value={companyName}
//                                     onChange={(e) => setCompanyName(e.target.value)}
//                                 />
//                             </div>
//                             <div className="form-div">
//                                 <label htmlFor="job-title">Job Title</label>
//                                 <input
//                                     type="text"
//                                     name="job-title"
//                                     placeholder="Job Title"
//                                     id="job-title"
//                                     value={jobTitle}
//                                     onChange={(e) => setJobTitle(e.target.value)}
//                                 />
//                             </div>
//                             <div className="form-div">
//                                 <label htmlFor="job-description">Job Description</label>
//                                 <textarea
//                                     rows={5}
//                                     name="job-description"
//                                     placeholder="Job Description"
//                                     id="job-description"
//                                     value={jobDescription}
//                                     onChange={(e) => setJobDescription(e.target.value)}
//                                 />
//                             </div>
//
//                             <div className="form-div">
//                                 <label htmlFor="uploader">Upload Resume</label>
//                                 <FileUploader onFileSelect={handleFileSelect} />
//                             </div>
//
//                             <button className="primary-button" type="submit" disabled={isProcessing}>
//                                 Analyze Resume
//                             </button>
//                         </form>
//                     )}
//                 </div>
//             </section>
//         </main>
//     )
// }
// export default Upload


// ==================================================================================================================
// ==================================================================================================================

import {type FormEvent, useState} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";


const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    // State variables for job details
    const [jobUrl, setJobUrl] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');

    // State variable for error messages
    const [jobUrlError, setJobUrlError] = useState<string | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file);
    };

    const handleAutofill = async (url: string) => {
        setJobUrlError(null); // Clear previous errors

        if (!url || !url.startsWith('http')) {
            setJobUrlError('Please enter a valid job URL.');
            return;
        }

        setIsProcessing(true);
        setStatusText('Fetching job details from URL...');

        const prompt = `
    Extract ONLY the company name, job title, and job description from the following URL.
    Return STRICT JSON in this exact format:
    {
      "companyName": "...",
      "jobTitle": "...",
      "jobDescription": "..."
    }
    Do not include explanations or extra text.
    URL: ${url}
  `;

        try {
            const aiResponse = await ai.chat(prompt);

            if (aiResponse && aiResponse.message.content) {
                const content = aiResponse.message.content;
                const textContent = typeof content === 'string' ? content : content[0]?.text;

                let parsedData;
                try {
                    // Try to extract JSON even if extra text exists
                    const match = textContent.match(/\{[\s\S]*\}/);
                    if (match) {
                        parsedData = JSON.parse(match[0]);
                    } else {
                        throw new Error("No JSON found in AI response");
                    }
                } catch (parseErr) {
                    console.error("AI JSON parse error:", parseErr, "Raw:", textContent);
                    setJobUrlError("AI response was not valid JSON. Please try again.");
                    return;
                }

                setCompanyName(parsedData.companyName || "");
                setJobTitle(parsedData.jobTitle || "");
                setJobDescription(parsedData.jobDescription || "");
                setStatusText("Job details filled successfully!");
            } else {
                setJobUrlError("Error: Failed to get a valid response from the AI.");
            }
        } catch (error) {
            console.error("AI chat error:", error);
            setJobUrlError("Error: Failed to process URL. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File  }) => {
        setIsProcessing(true);

        setStatusText('Uploading the file...');
        const uploadedFile = await fs.upload([file]);
        if(!uploadedFile) return setStatusText('Error: Failed to upload file');

        setStatusText('Converting to image...');
        const imageFile = await convertPdfToImage(file);
        if(!imageFile.file) return setStatusText('Error: Failed to convert PDF to image');

        setStatusText('Uploading the image...');
        const uploadedImage = await fs.upload([imageFile.file]);
        if(!uploadedImage) return setStatusText('Error: Failed to upload image');

        setStatusText('Preparing data...');
        const uuid = generateUUID();
        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName, jobTitle, jobDescription,
            feedback: '',
        }
        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        setStatusText('Analyzing...');

        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({ jobTitle, jobDescription })
        );
        if (!feedback) return setStatusText('Error: Failed to analyze resume');

        const feedbackText = typeof feedback.message.content === 'string'
            ? feedback.message.content
            : feedback.message.content[0].text;

        try {
            // Attempt to parse the JSON response from the AI
            data.feedback = JSON.parse(feedbackText);
            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            setStatusText('Analysis complete, redirecting...');
            console.log(data);
            navigate(`/resume/${uuid}`);
        } catch (e) {
            // Handle JSON parsing errors
            setStatusText('Error: The AI response was not in the correct format. Please try again.');
            console.error('JSON Parsing Error:', e);
        } finally {
            setIsProcessing(false);
        }
    };
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    };

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-1/3" alt="Resume scan" />
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="job-url">Job URL</label>
                                <div className="flex gap-2 w-1/2">
                                    <input
                                        type="url"
                                        name="job-url"
                                        placeholder="Paste Job URL here"
                                        id="job-url"
                                        value={jobUrl}
                                        onChange={(e) => {
                                            setJobUrl(e.target.value);
                                        }}
                                        onPaste={(e) => {
                                            const pastedText = e.clipboardData.getData('text');
                                            setJobUrl(pastedText);
                                            handleAutofill(pastedText);
                                        }}
                                    />
                                </div>
                                {jobUrlError && (
                                    <p className="text-red-500 text-sm mt-1">{jobUrlError}</p>
                                )}
                            </div>
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input
                                    type="text"
                                    name="company-name"
                                    placeholder="Company Name"
                                    id="company-name"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input
                                    type="text"
                                    name="job-title"
                                    placeholder="Job Title"
                                    id="job-title"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea
                                    rows={5}
                                    name="job-description"
                                    placeholder="Job Description"
                                    id="job-description"
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className="primary-button" type="submit" disabled={isProcessing}>
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}
export default Upload