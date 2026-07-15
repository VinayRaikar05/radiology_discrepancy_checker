"use server"

import { databaseService } from "@/lib/database"
import { getServerSession } from "next-auth"
import { getAuthOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function fetchReportsForReview() {
  try {
    const session = await getServerSession(getAuthOptions())
    if (!session) {
      throw new Error("Unauthorized")
    }

    const reports = await databaseService.getReportsForReview()
    return reports || []
  } catch (error) {
    console.error("Failed to fetch reports for review:", error)
    return []
  }
}

export async function submitReviewAction(
  reportId: string,
  action: "approve" | "revise",
  commentText: string
) {
  try {
    const session = await getServerSession(getAuthOptions())
    if (!session) {
      throw new Error("Unauthorized")
    }

    const user = await databaseService.getUserByEmail(session.user?.email || "")
    if (!user) {
      throw new Error("User not found")
    }

    // Determine target status
    const status = action === "approve" ? "approved" : "flagged"

    // 1. Update report status
    const success = await databaseService.updateReportStatus(reportId, status)
    if (!success) {
      throw new Error("Failed to update status")
    }

    // 2. Create comment if provided
    if (commentText && commentText.trim()) {
      await databaseService.createComment({
        report_id: reportId,
        user_id: user.id,
        comment_text: commentText.trim(),
      })
    }

    revalidatePath("/review")
    return { success: true }
  } catch (error: any) {
    console.error("Failed to submit review action:", error)
    return { success: false, error: error.message }
  }
}

export async function fetchReportComments(reportId: string) {
  try {
    return await databaseService.getComments(reportId)
  } catch (error) {
    console.error("Failed to fetch report comments:", error)
    return []
  }
}
