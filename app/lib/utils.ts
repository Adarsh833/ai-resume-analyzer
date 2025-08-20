
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as cheerio from "cheerio";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export const generateUUID = () => crypto.randomUUID();

// New type for the extracted details
export interface ExtractedJobDetails {
    jobTitle: string | null;
    companyName: string | null;
    jobDescription: string | null;
}

// New function to fetch and parse the URL content
export async function extractJobDetailsFromUrl(
    url: string
): Promise<ExtractedJobDetails> {
    try {
        const response = await fetch(url);
        const htmlText = await response.text();

        const $ = cheerio.load(htmlText);

        // Try multiple selectors for robustness
        const jobTitle =
            $("h1").first().text().trim() || $("title").text().trim() || null;

        const companyName =
            $('meta[property="og:site_name"]').attr("content") ||
            $('meta[name="twitter:site"]').attr("content") ||
            $("h2").first().text().trim() ||
            null;

        const jobDescription =
            $(".job-description").text().trim() ||
            $("#job-description").text().trim() ||
            $('[data-automation="jobDescription"]').text().trim() || // MS Careers
            null;

        return {
            jobTitle: jobTitle || null,
            companyName: companyName || null,
            jobDescription: jobDescription || null,
        };
    } catch (error) {
        console.error("Failed to extract job details:", error);
        return {
            jobTitle: null,
            companyName: null,
            jobDescription: null,
        };
    }
}

