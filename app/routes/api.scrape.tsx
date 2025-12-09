// @ts-ignore
import type { Route } from "./+types/api.scrape";
import * as cheerio from "cheerio";

// Prevent GET request errors
export function loader() {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const raw = form.get("url");
  const url = typeof raw === "string" ? raw : "";

  if (!url) {
    return { success: false, error: "Missing or invalid URL" };
  }

  try {
    const html = await fetch(url).then(r => r.text());
    const $ = cheerio.load(html);

    const companyName =
      $("meta[property='og:site_name']").attr("content") ||
      $("meta[name='company']").attr("content") ||
      $("title").text().trim();

    const jobTitle =
      $("h1").first().text().trim() ||
      $("meta[property='og:title']").attr("content") ||
      "Unknown Title";

let container =
  $("#description").html() ||
  $("#job-detail").html() ||
  $("[data-test-id='job-description']").html() ||
  $(".job-description").html() ||
  "";

// Clean formatting
let jobDescription = container
  // Bullet points
  .replace(/<li[^>]*>/g, "• ")
  .replace(/<\/li>/g, "\n")
  // Line breaks
  .replace(/<br\s*\/?>/gi, "\n")
  // Paragraphs
  .replace(/<p[^>]*>/g, "")
  .replace(/<\/p>/g, "\n\n")
  // Remove JS & script tags
  .replace(/<script[\s\S]*?<\/script>/gi, "")
  // Remove HTML tags
  .replace(/<\/?[^>]+>/g, "")
  // Remove repeated whitespace
  .replace(/\n\s*\n\s*\n/g, "\n\n")
  .trim();


    return {
      success: true,
      companyName,
      jobTitle,
      jobDescription,
    };
  } catch (err) {
    return {
      success: false,
      error: "Failed to scrape URL",
      details: String(err),
    };
  }
}
