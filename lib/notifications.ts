import nodemailer from "nodemailer"

interface NotificationOptions {
  to: string
  subject: string
  html: string
  text?: string
}

class NotificationService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    // Initialize email transporter if SMTP is configured
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = process.env.SMTP_PORT
    const smtpUser = process.env.SMTP_USER
    const smtpPassword = process.env.SMTP_PASSWORD

    if (smtpHost && smtpPort && smtpUser && smtpPassword) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: smtpPort === "465",
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      })
    }
  }

  async sendEmail(options: NotificationOptions): Promise<boolean> {
    if (!this.transporter) {
      console.warn("Email not configured. Skipping email notification.")
      return false
    }

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ""),
      })
      return true
    } catch (error) {
      console.error("Email send error:", error)
      return false
    }
  }

  async notifyReportFlagged(
    userEmail: string,
    reportId: string,
    patientId: string,
    riskLevel: string,
  ): Promise<boolean> {
    const subject = `Report Flagged: ${patientId} - ${riskLevel.toUpperCase()} Risk`
    const html = `
      <h2>Report Flagged for Review</h2>
      <p>A radiology report has been flagged and requires your attention.</p>
      <ul>
        <li><strong>Patient ID:</strong> ${patientId}</li>
        <li><strong>Report ID:</strong> ${reportId}</li>
        <li><strong>Risk Level:</strong> ${riskLevel.toUpperCase()}</li>
      </ul>
      <p>Please review the report in the RadiologyAI system.</p>
      <p><a href="${process.env.NEXTAUTH_URL}/review?id=${reportId}">View Report</a></p>
    `

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
    })
  }

  async notifyAnalysisComplete(
    userEmail: string,
    reportId: string,
    patientId: string,
    confidence: number,
  ): Promise<boolean> {
    const subject = `Analysis Complete: ${patientId}`
    const html = `
      <h2>Report Analysis Complete</h2>
      <p>The AI analysis for the radiology report has been completed.</p>
      <ul>
        <li><strong>Patient ID:</strong> ${patientId}</li>
        <li><strong>Report ID:</strong> ${reportId}</li>
        <li><strong>Confidence:</strong> ${(confidence * 100).toFixed(1)}%</li>
      </ul>
      <p><a href="${process.env.NEXTAUTH_URL}/review?id=${reportId}">View Results</a></p>
    `

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
    })
  }

  async notifyUserCreated(userEmail: string, userName: string, role: string): Promise<boolean> {
    const subject = "Welcome to RadiologyAI"
    const html = `
      <h2>Welcome to RadiologyAI</h2>
      <p>Hello ${userName},</p>
      <p>Your account has been created with the role: <strong>${role}</strong></p>
      <p>You can now access the system at: <a href="${process.env.NEXTAUTH_URL}">${process.env.NEXTAUTH_URL}</a></p>
    `

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
    })
  }
}

export const notificationService = new NotificationService()

