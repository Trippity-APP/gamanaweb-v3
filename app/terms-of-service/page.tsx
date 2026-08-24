"use client";

import Link from "next/link";
import { FileText, Mail, Calendar } from "lucide-react";
import Header from "@/components/navigation/header";
import Footer from "@/components/navigation/footer";

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#159895] via-[#57C5B6] to-[#1A5F7A] text-white py-20 pt-32 md:pt-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
                <FileText className="h-8 w-8" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[62px] font-black mb-6 leading-tight">
                Terms of Use
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Please read these terms carefully before using Gamana.
              </p>
              <div className="flex items-center justify-center gap-4 mt-6 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Effective Date: August 01, 2025</span>
                </div>
                <span className="text-white/60">•</span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Last Updated: August 01, 2025</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <div className="space-y-8 text-gray-700">
                {/* Section 1 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
                  <p className="leading-relaxed">
                    These Terms of Use ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and SIARLabs LLC ("Company," "we," "us," or "our") regarding your use of the Gamana mobile application and related services (collectively, the "Service").
                  </p>
                  <p className="leading-relaxed mt-4">
                    By downloading, installing, accessing, or using Gamana, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, do not use our Service.
                  </p>
                </div>

                {/* Section 2 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
                  <p className="leading-relaxed mb-3">
                    Gamana is an AI-powered audio tour application that provides location-based tourism content through:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Interactive Audio Tours:</strong> AI-generated and curated audio content triggered by your geographic location</li>
                    <li><strong>Real-time Navigation:</strong> GPS-based mapping and wayfinding for tourist destinations</li>
                    <li><strong>Text-to-Speech Technology:</strong> Conversion of written content into spoken audio</li>
                    <li><strong>Personalized Recommendations:</strong> Location-aware suggestions based on user preferences and behavior</li>
                    <li><strong>Offline Functionality:</strong> Downloaded content for use without internet connectivity</li>
                  </ul>
                </div>

                {/* Section 3 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Eligibility and Account Registration</h2>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">3.1 Age Requirements</h3>
                  <p className="leading-relaxed">
                    You must be at least 13 years old to use Gamana. Users under 18 must have parental or guardian consent.
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">3.2 Account Creation</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You may use Gamana with or without creating an account</li>
                    <li>If you create an account, you must provide accurate and complete information</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                    <li>You agree to notify us immediately of any unauthorized access to your account</li>
                  </ul>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">3.3 Account Responsibilities</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>One account per person; sharing accounts is prohibited</li>
                    <li>You are solely responsible for all activities under your account</li>
                    <li>We reserve the right to suspend or terminate accounts that violate these Terms</li>
                  </ul>
                </div>

                {/* Section 4 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Acceptable Use Policy</h2>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">4.1 Permitted Uses</h3>
                  <p className="leading-relaxed mb-3">You may use Gamana for:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Personal, non-commercial tourism and educational purposes</li>
                    <li>Accessing audio tours and location-based content</li>
                    <li>Sharing your experiences through permitted social features</li>
                  </ul>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">4.2 Prohibited Uses</h3>
                  <p className="leading-relaxed mb-3">You agree NOT to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Violate Laws:</strong> Use the Service for any illegal or unauthorized purpose</li>
                    <li><strong>Misuse Location Services:</strong> Attempt to spoof, manipulate, or falsify location data</li>
                    <li><strong>Reverse Engineer:</strong> Decompile, disassemble, or reverse engineer the application</li>
                    <li><strong>Commercial Exploitation:</strong> Redistribute, sell, or commercially exploit our content</li>
                    <li><strong>Automated Access:</strong> Use bots, scrapers, or automated tools to access the Service</li>
                    <li><strong>Interfere with Service:</strong> Attempt to disrupt, damage, or impair the Service's functionality</li>
                    <li><strong>Inappropriate Content:</strong> Upload or share offensive, harmful, or inappropriate content</li>
                    <li><strong>Privacy Violations:</strong> Attempt to access other users' private information</li>
                    <li><strong>Intellectual Property Infringement:</strong> Use copyrighted material without permission</li>
                  </ul>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">4.3 Location-Specific Restrictions</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Respect private property and restricted areas</li>
                    <li>Follow local laws and regulations while using location-based features</li>
                    <li>Do not use the Service in areas where electronic devices are prohibited</li>
                    <li>Exercise caution and prioritize safety over app usage</li>
                  </ul>
                </div>

                {/* Section 5 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Content and Intellectual Property</h2>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">5.1 Our Content</h3>
                  <p className="leading-relaxed mb-3">
                    All content provided through Gamana, including but not limited to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mb-3">
                    <li>Audio tours and narrations</li>
                    <li>Maps and geographic data</li>
                    <li>AI-generated content</li>
                    <li>User interface elements</li>
                    <li>Software code and algorithms</li>
                  </ul>
                  <p className="leading-relaxed">
                    Is owned by SIARLabs LLC or our licensors and is protected by copyright, trademark, and other intellectual property laws.
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">5.2 License to Use Our Content</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access and use Gamana for personal, non-commercial purposes</li>
                    <li>Download content for offline use within the app</li>
                    <li>Share experiences through designated social features</li>
                  </ul>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">5.3 User-Generated Content</h3>
                  <p className="leading-relaxed mb-3">If you submit content (reviews, photos, comments):</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You retain ownership of your original content</li>
                    <li>You grant us a worldwide, royalty-free license to use, display, and distribute your content in connection with the Service</li>
                    <li>You represent that you have the right to submit such content</li>
                    <li>We may moderate, edit, or remove user content at our discretion</li>
                  </ul>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">5.4 Third-Party Content</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>We may include content from third-party sources</li>
                    <li>Such content is owned by the respective third parties</li>
                    <li>We do not guarantee the accuracy or availability of third-party content</li>
                  </ul>
                </div>

                {/* Section 6 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">6. AI-Generated Content and Disclaimers</h2>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">6.1 AI Content Nature</h3>
                  <p className="leading-relaxed mb-3">
                    Gamana uses artificial intelligence to generate audio tour content. You acknowledge that:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>AI-generated content may contain inaccuracies or errors</li>
                    <li>Content is created algorithmically and may not reflect human editorial oversight</li>
                    <li>Historical, cultural, or factual information should be independently verified</li>
                  </ul>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">6.2 Content Accuracy Disclaimer</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>We strive for accuracy but do not guarantee the completeness or correctness of all content</li>
                    <li>Users should use critical thinking and additional sources for important decisions</li>
                    <li>Cultural and historical interpretations may vary, and our content represents one perspective</li>
                  </ul>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">6.3 Real-Time Information</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Location-based information may change rapidly</li>
                    <li>Operating hours, accessibility, and availability of attractions may differ from app content</li>
                    <li>Always verify current conditions before visiting locations</li>
                  </ul>
                </div>

                {/* Section 7 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Privacy and Location Data</h2>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">7.1 Location Services</h3>
                  <p className="leading-relaxed mb-3">
                    Gamana requires location access to function properly. By using the Service, you consent to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Collection of your real-time location data</li>
                    <li>Storage of location history for service improvement</li>
                    <li>Use of location data to trigger relevant content</li>
                  </ul>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">7.2 Privacy Practices</h3>
                  <p className="leading-relaxed">
                    Your privacy is important to us. Please review our Privacy Policy for detailed information about how we collect, use, and protect your data.
                  </p>
                </div>

                {/* Section 8 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Payment Terms and Subscriptions</h2>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">8.1 Free and Paid Features</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Basic functionality of Gamana may be provided free of charge</li>
                    <li>Premium features may require payment or subscription</li>
                    <li>Pricing and available features are subject to change with notice</li>
                  </ul>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">8.2 Subscription Terms</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Subscriptions automatically renew unless cancelled</li>
                    <li>You may cancel subscriptions through your device's app store settings</li>
                    <li>Refunds are governed by the app store's refund policy</li>
                    <li>Price changes will be communicated in advance</li>
                  </ul>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">8.3 In-App Purchases</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>All purchases are processed through your device's app store</li>
                    <li>We do not directly handle payment processing</li>
                    <li>Purchases are subject to the app store's terms and conditions</li>
                  </ul>
                </div>

                {/* Section 9 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">9. Service Availability and Modifications</h2>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">9.1 Service Availability</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>We strive to maintain Service availability but do not guarantee uninterrupted access</li>
                    <li>Service may be temporarily unavailable due to maintenance, updates, or technical issues</li>
                    <li>Geographic availability may vary based on local laws and technical limitations</li>
                  </ul>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">9.2 Modifications to Service</h3>
                  <p className="leading-relaxed mb-3">We reserve the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Modify, update, or discontinue features</li>
                    <li>Change content availability</li>
                    <li>Update these Terms with reasonable notice</li>
                    <li>Implement new technologies and improvements</li>
                  </ul>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">9.3 Device Compatibility</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Gamana requires compatible mobile devices and operating systems</li>
                    <li>We may discontinue support for older devices or OS versions</li>
                    <li>Optimal functionality may require specific device capabilities (GPS, audio, internet)</li>
                  </ul>
                </div>

                {/* Section 10 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">10. Disclaimers and Limitation of Liability</h2>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">10.1 Service Disclaimer</h3>
                  <p className="leading-relaxed mb-3">
                    GAMANA IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE</li>
                    <li>ACCURACY, RELIABILITY, OR AVAILABILITY OF CONTENT</li>
                    <li>UNINTERRUPTED OR ERROR-FREE OPERATION</li>
                  </ul>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">10.2 Limitation of Liability</h3>
                  <p className="leading-relaxed mb-3">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>OUR LIABILITY FOR ANY DAMAGES SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SERVICE IN THE 12 MONTHS PRECEDING THE CLAIM</li>
                    <li>WE SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
                    <li>WE ARE NOT RESPONSIBLE FOR DAMAGES RESULTING FROM YOUR USE OR INABILITY TO USE THE SERVICE</li>
                  </ul>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">10.3 Safety Disclaimer</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Always prioritize personal safety over app usage</li>
                    <li>Be aware of your surroundings while using location-based features</li>
                    <li>Follow local traffic laws and safety regulations</li>
                    <li>We are not responsible for accidents or injuries that occur while using the Service</li>
                  </ul>
                </div>

                {/* Section 11 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">11. Indemnification</h2>
                  <p className="leading-relaxed mb-3">
                    You agree to indemnify, defend, and hold harmless SIARLabs LLC, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Your use of the Service</li>
                    <li>Your violation of these Terms</li>
                    <li>Your violation of any third-party rights</li>
                    <li>Your user-generated content</li>
                  </ul>
                </div>

                {/* Section 12 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">12. Termination</h2>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">12.1 Termination by You</h3>
                  <p className="leading-relaxed mb-3">You may stop using Gamana at any time by:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Deleting the application from your device</li>
                    <li>Deactivating your account (if applicable)</li>
                    <li>Contacting us to request account closure</li>
                  </ul>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">12.2 Termination by Us</h3>
                  <p className="leading-relaxed mb-3">We may terminate or suspend your access if:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You violate these Terms or our policies</li>
                    <li>We believe your actions may harm other users or the Service</li>
                    <li>Required by law or legal process</li>
                    <li>We discontinue the Service</li>
                  </ul>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">12.3 Effect of Termination</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Your right to use the Service immediately ceases</li>
                    <li>We may delete your account and associated data</li>
                    <li>Provisions regarding intellectual property, liability, and dispute resolution survive termination</li>
                  </ul>
                </div>

                {/* Section 13 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">13. International Use and Export Controls</h2>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">13.1 Global Availability</h3>
                  <p className="leading-relaxed">
                    Gamana may not be available in all countries. You are responsible for complying with local laws in your jurisdiction.
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">13.2 Export Compliance</h3>
                  <p className="leading-relaxed">
                    The Service may be subject to export control laws. You agree not to export or re-export the Service in violation of applicable laws.
                  </p>
                </div>

                {/* Section 14 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">14. Dispute Resolution</h2>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">14.1 Governing Law</h3>
                  <p className="leading-relaxed">
                    These Terms are governed by the laws of [Insert State/Jurisdiction], without regard to conflict of law principles.
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">14.2 Dispute Resolution Process</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Informal Resolution:</strong> Contact us at <a href="mailto:legal@siarlabs.com" className="text-[#159895] hover:underline">legal@siarlabs.com</a> to attempt resolution</li>
                    <li><strong>Mediation:</strong> If informal resolution fails, disputes may be submitted to mediation</li>
                    <li><strong>Arbitration:</strong> Unresolved disputes shall be settled by binding arbitration in accordance with the rules of the American Arbitration Association</li>
                  </ul>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">14.3 Class Action Waiver</h3>
                  <p className="leading-relaxed">
                    You agree to resolve disputes individually and waive the right to participate in class actions or collective proceedings.
                  </p>
                </div>

                {/* Section 15 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">15. Miscellaneous Provisions</h2>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">15.1 Entire Agreement</h3>
                  <p className="leading-relaxed">
                    These Terms, together with our Privacy Policy, constitute the entire agreement between you and us regarding the Service.
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">15.2 Severability</h3>
                  <p className="leading-relaxed">
                    If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">15.3 No Waiver</h3>
                  <p className="leading-relaxed">
                    Our failure to enforce any provision does not constitute a waiver of that provision or any other provision.
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">15.4 Assignment</h3>
                  <p className="leading-relaxed">
                    You may not assign your rights under these Terms. We may assign our rights without restriction.
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">15.5 Force Majeure</h3>
                  <p className="leading-relaxed">
                    We are not liable for delays or failures due to circumstances beyond our reasonable control.
                  </p>
                </div>

                {/* Section 16 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">16. Updates to Terms</h2>
                  <p className="leading-relaxed mb-4">
                    We may update these Terms from time to time. We will notify you of material changes by:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Posting updated Terms in the app</li>
                    <li>Sending notifications through the app or email</li>
                    <li>Requiring acceptance of new Terms before continued use</li>
                  </ul>
                  <p className="leading-relaxed mt-4">
                    Continued use of the Service after changes constitutes acceptance of the updated Terms.
                  </p>
                </div>

                {/* Section 17 */}
                <div className="bg-gray-50 rounded-lg p-8 mt-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">17. Contact Information</h2>
                  <p className="leading-relaxed mb-4">
                    For questions about these Terms, please contact us:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-[#159895] mt-1" />
                      <div>
                        <p className="font-semibold">Legal Inquiries</p>
                        <a href="mailto:support@gamana.app" className="text-[#159895] hover:underline">
                          support@gamana.app
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-[#159895] mt-1" />
                      <div>
                        <p className="font-semibold">General Support</p>
                        <a href="mailto:support@gamana.app" className="text-[#159895] hover:underline">
                          support@gamana.app
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 18 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">18. Digital Millennium Copyright Act (DMCA) Notice</h2>
                  <p className="leading-relaxed mb-4">
                    If you believe that content in Gamana infringes your copyright, please send a DMCA notice to: <a href="mailto:support@gamana.app" className="text-[#159895] hover:underline">support@gamana.app</a>
                  </p>
                  <p className="leading-relaxed mb-3">Include:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Identification of the copyrighted work</li>
                    <li>Location of the allegedly infringing content</li>
                    <li>Your contact information</li>
                    <li>A statement of good faith belief that use is not authorized</li>
                    <li>A statement that the information is accurate and you are authorized to act</li>
                  </ul>
                </div>

                {/* Footer Note */}
                <div className="border-t border-gray-200 pt-8 mt-12">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Last Updated:</strong> August 01, 2025
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Version:</strong> 1.0
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    By using Gamana, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

