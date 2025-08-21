// index.ts

// Type definition for Resume data
export interface Resume {
    id: string;
    companyName: string;
    jobTitle: string;
    imagePath: string;
    resumePath: string;
    feedback: Feedback;
}

// Feedback type (aligns with AIResponseFormat)
export interface Feedback {
    overallScore: number;
    ATS: {
        score: number;
        tips: { type: "good" | "improve"; tip: string }[];
    };
    toneAndStyle: {
        score: number;
        tips: { type: "good" | "improve"; tip: string; explanation?: string }[];
    };
    content: {
        score: number;
        tips: { type: "good" | "improve"; tip: string; explanation?: string }[];
    };
    structure: {
        score: number;
        tips: { type: "good" | "improve"; tip: string; explanation?: string }[];
    };
    skills: {
        score: number;
        tips: { type: "good" | "improve"; tip: string; explanation?: string }[];
    };
}

// Mock resumes data
export const resumes: Resume[] = [
    {
        id: "1",
        companyName: "Google",
        jobTitle: "Frontend Developer",
        imagePath: "/images/resume_01.png",
        resumePath: "/resumes/resume-1.pdf",
        feedback: {
            overallScore: 85,
            ATS: { score: 90, tips: [] },
            toneAndStyle: { score: 90, tips: [] },
            content: { score: 90, tips: [] },
            structure: { score: 90, tips: [] },
            skills: { score: 90, tips: [] },
        },
    },
    {
        id: "2",
        companyName: "Microsoft",
        jobTitle: "Cloud Engineer",
        imagePath: "/images/resume_02.png",
        resumePath: "/resumes/resume-2.pdf",
        feedback: {
            overallScore: 55,
            ATS: { score: 90, tips: [] },
            toneAndStyle: { score: 90, tips: [] },
            content: { score: 90, tips: [] },
            structure: { score: 90, tips: [] },
            skills: { score: 90, tips: [] },
        },
    },
    {
        id: "3",
        companyName: "Apple",
        jobTitle: "iOS Developer",
        imagePath: "/images/resume_03.png",
        resumePath: "/resumes/resume-3.pdf",
        feedback: {
            overallScore: 75,
            ATS: { score: 90, tips: [] },
            toneAndStyle: { score: 90, tips: [] },
            content: { score: 90, tips: [] },
            structure: { score: 90, tips: [] },
            skills: { score: 90, tips: [] },
        },
    },
];

// AI response format (for reference only, not executed at runtime)
export const AIResponseFormat = `
interface Feedback {
  overallScore: number;
  ATS: { score: number; tips: { type: "good" | "improve"; tip: string }[] };
  toneAndStyle: { score: number; tips: { type: "good" | "improve"; tip: string; explanation: string }[] };
  content: { score: number; tips: { type: "good" | "improve"; tip: string; explanation: string }[] };
  structure: { score: number; tips: { type: "good" | "improve"; tip: string; explanation: string }[] };
  skills: { score: number; tips: { type: "good" | "improve"; tip: string; explanation: string }[] };
}
`;

// Function to prepare instructions for AI
export const prepareInstructions = ({
                                        jobTitle,
                                        jobDescription,
                                    }: {
    jobTitle: string;
    jobDescription: string;
}) => `
You are an expert in ATS (Applicant Tracking System) and resume analysis.
Please analyze and rate this resume and suggest how to improve it.
The rating can be low if the resume is bad.
Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
If there is a lot to improve, don't hesitate to give low scores. This is to help the user to improve their resume.
If available, use the job description for the job user is applying to to give more detailed feedback.
The job title is: ${jobTitle}
The job description is: ${jobDescription}

For the 'skills' section, please follow these specific instructions:
1. Perform a detailed skills gap analysis by comparing the skills listed in the resume against the requirements in the job description.
2. For each skill identified as a gap, suggest a specific and relevant online learning resource and certifications(optional).
3. For each suggested resource, provide a title and a valid URL.

Provide the feedback using the following format: ${AIResponseFormat}
Return the analysis as a JSON object, without any other text and without the backticks.
Do not include any other text or comments.
`;
