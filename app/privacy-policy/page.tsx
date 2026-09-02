"use client";

import Link from "next/link";
import { Shield, Mail, Calendar, FileText } from "lucide-react";
import Header from "@/components/navigation/header";
import Footer from "@/components/navigation/footer";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#159895] via-[#57C5B6] to-[#1A5F7A] text-white py-20 pt-32 md:pt-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
                <Shield className="h-8 w-8" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[62px] font-black mb-6 leading-tight">
                Privacy Policy
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Your privacy is important to us. This policy explains how we collect, use, and protect your information.
              </p>
              <div className="flex items-center justify-center gap-4 mt-6 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Effective Date: August 1, 2025</span>
                </div>
                <span className="text-white/60">•</span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Last Updated: November 2, 2025</span>
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
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">1. About This Policy</h2>
                  <p className="leading-relaxed">
                    This Privacy Policy explains how SIARLabs LLC ("Gamana," "we," "us," or "our") collects, uses, shares, and protects your personal information when you use the Gamana mobile app, website, and related services, referred to here as 'Gamana Services'. It also outlines your privacy rights and choices under applicable laws.
                  </p>
                  <p className="leading-relaxed mt-4">
                    By using Gamana, you agree to the practices described in this Policy. If you do not agree, please refrain from using our app and any Gamana Services.
                  </p>
                  <p className="leading-relaxed mt-4">
                    Please note, - Our Cookie Policy, is a separate document which explains how we use cookies and how to manage your preferences. Cookies are files saved to your device (phone, tablet, computer, etc.) when you visit our website.
                  </p>
                  <p className="leading-relaxed mt-4">
                    - Our Terms of Service, is a separate document which outlines the legal contract between you and Gamana for using Gamana Services.
                  </p>
                </div>

                {/* Section 2 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Your Privacy Rights and Choices</h2>
                  <p className="leading-relaxed mb-4">
                    Depending on your location and applicable law, you may have the following rights regarding your personal information:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li><strong>Right to Be Informed:</strong> You have the right to clear and transparent information about how we process your data – that's the purpose of this Privacy Policy. We will inform you of significant changes and provide notices at data collection points as required.</li>
                    <li><strong>Right to Access:</strong> You can request a copy of the personal data we hold about you. This includes information on how we obtained the data, how we use it, and with whom we share it.</li>
                    <li><strong>Right to Rectification:</strong> If your information is incorrect or incomplete, you have the right to request correction or update of your data. You can also edit certain profile details in-app.</li>
                    <li><strong>Right to Deletion:</strong> You may ask us to delete your personal data. We will honor such requests and erase your data unless we are required or permitted to keep it for legitimate reasons (for example, to comply with legal obligations, resolve disputes, or prevent fraud). We will let you know if any information must be retained.</li>
                    <li><strong>Right to Withdraw Consent:</strong> If we process your data based on consent (for example, for location tracking or marketing), you can withdraw that consent at any time. This will not affect the lawfulness of processing before withdrawal.</li>
                    <li><strong>Right to Object/Opt-Out:</strong> You can object to certain data processing activities. For example, you can opt out of receiving marketing emails (see Section 6.3) or object to any profiling or automated decision-making that affects you (see Section 3.3). If we use your data for direct marketing or personalized advertising, you can ask us to stop. California residents can also opt out of the "sale" or "sharing" of personal information for targeted advertising (see Section 11.2).</li>
                    <li><strong>Right to Restrict Processing:</strong> In certain circumstances (for instance, if you contest the accuracy of your data or the lawfulness of processing), you can request a temporary restriction on processing your data.</li>
                    <li><strong>Right to Data Portability:</strong> You have the right to receive your personal data in a structured, commonly used, machine-readable format, and to request that we transfer it to another service provider where feasible.</li>
                    <li><strong>Right to Non-Discrimination:</strong> If you exercise any privacy rights, we will not discriminate against you. Access to our services and pricing will remain the same under equal conditions, per California law.</li>
                    <li><strong>Right to Lodge a Complaint:</strong> If you believe your rights have been violated, you can contact us (see Section 12), and you also have the right to file a complaint with a supervisory authority or regulatory body. For example, EU/UK users can contact their Data Protection Authority; California residents can contact the California Privacy Protection Agency; and Indian users can approach the Data Protection Board of India if unsatisfied with our response.</li>
                  </ul>
                  <p className="leading-relaxed mt-4">
                    <strong>Exercising Your Rights:</strong> You may contact us at <a href="mailto:privacy@gamana.app" className="text-[#159895] hover:underline">privacy@gamana.app</a> at any time to exercise the rights above or ask questions. We will respond within the timeframe required by law (generally within 30 days). To protect your privacy, we may verify your identity before fulfilling your request. In some cases, you may also use in-app settings to access, update, or delete certain information (for example, editing your profile or using the "Delete Account" feature). If you have authorized an agent or representative (such as under California law or as a nominee under India's DPDP Act) to make requests on your behalf, we will process the request in accordance with applicable law. You will not be charged for exercising your rights, and we will not deny you our services for doing so.
                  </p>
                </div>

                {/* Section 3 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Personal Data We Collect About You</h2>
                  <p className="leading-relaxed mb-4">
                    We collect various types of information from you and about you in order to provide and improve Gamana's services. This includes:
                  </p>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">a. Information You Provide Directly:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Account Information:</strong> When you sign up or create an account, we collect information such as your name, email address, username, and password. You may also choose to provide a profile photo or username nickname (optional).</li>
                    <li><strong>Contact Information:</strong> If you subscribe to our newsletter or updates, we collect your email address. If you contact support or send feedback, we collect your email and the content of your communications.</li>
                    <li><strong>Payment Information:</strong> If you purchase a premium plan or any paid content, payment details are handled via the App Store/Google Play or our payment processor. We do not store your full credit card number or banking details on our servers; however, we may receive confirmation of your purchase and basic billing information (like transaction ID or subscription status) from the app platform or payment provider for record-keeping.</li>
                    <li><strong>Emergency Contacts (optional):</strong> For your safety, the app may allow you to input an emergency contact (name, phone/email) to use with our SOS feature. This information is used only for that feature and with your consent.</li>
                    <li><strong>User-Generated Content:</strong> If our platform allows community features (such as suggesting a new tour spot, posting reviews, or participating in forums), any content you submit (including text, images, audio, or votes) will be collected. Note that such content may be visible to others if it is a public feature. We advise you to avoid sharing personal information in public contributions.</li>
                  </ul>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">b. Information We Collect Automatically:</h3>
                  <p className="leading-relaxed mb-3">When you use Gamana, certain data is collected automatically to operate our services efficiently:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Precise Location Data:</strong> We collect your real-time GPS location from your mobile device with your permission. This is core to Gamana's functionality – it allows us to provide location-specific audio stories and navigation. For example, as you walk, the app uses GPS to automatically trigger relevant audio content about nearby landmarks. We may also collect your location history during a session to improve content recommendations and performance (e.g. remembering which tours you've completed in a city). You control location sharing – you can disable or adjust location permissions anytime in your device settings (see Section 6.1 on Location Controls).</li>
                    <li><strong>Device and Technical Information:</strong> We receive data about the device and app you use, such as your device model, operating system version, unique device identifiers, and the app version. We also collect technical information like your IP address, browser type (for web visits), language preference, and crash logs or error reports if the app experiences a problem. This information helps us ensure compatibility and troubleshoot issues (for example, diagnosing a crash affecting a specific OS version).</li>
                    <li><strong>Usage Data:</strong> We track how you interact with Gamana to understand usage patterns and improve the user experience. This includes which features you use, which audio tours you play, pages or screens you view, the dates/times and duration of your sessions, and your in-app actions (such as taps, clicks, or navigation choices). For instance, we may log that you listened to a "Central Park Tour" and paused at certain points, or that you frequently explore museum-related content. We also note performance metrics like page load times or any errors you encounter. This usage data is often collected via analytics tools and is typically aggregated or pseudonymized.</li>
                    <li><strong>Audio Interaction Data:</strong> Gamana is an audio-first experience, so we collect data related to your audio usage. This includes which tour narrations you listen to, completion rates of tours, segments you skip or replay, and volume or playback settings. If you enable voice commands (e.g. using your voice to pause or navigate), we process your voice input locally or via our voice recognition service to execute your command. We do not store voice recordings on our servers; any audio from voice commands is used in real-time to interpret your request and then discarded.</li>
                    <li><strong>Preferences and Profile Data:</strong> We note your preferences within the app, such as favorite tours or locations you bookmark, your chosen narrator voices, language settings, and any accessibility options you use (like text size or audio captions). We may also keep track of your "likes" or upvotes if you participate in voting features (for example, voting to add a new tour spot). These preferences help personalize your experience (see Section 3.3 below).</li>
                  </ul>

                  <p className="leading-relaxed mt-4 mb-3">
                    <strong>Cookies and Similar Tech:</strong> On our website, we use cookies and similar technologies to collect information. Cookies are small text files stored on your device to remember info about you. They help with things like keeping you logged in, understanding how you use our site, and personalizing content or advertising. We classify cookies as essential, performance/analytics, functional, or advertising (see our Cookie Policy for details). For example, we use analytics cookies to see which blog pages are popular and how users navigate. We use advertising cookies (like Google or Meta Pixel) on our website to support any marketing campaigns and measure their effectiveness. Important: When required by law, we will ask for your consent before using non-essential cookies, and you can always adjust your cookie preferences via our cookie banner or your browser settings. (See Section (b) "Cookie Policy" below for more information on managing cookies and tracking.)
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">c. Information We Obtain from Third Parties:</h3>
                  <p className="leading-relaxed mb-3">We may receive your information from other sources:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Third-Party Sign-On:</strong> If you have the option to sign up or log in via a third-party account (like Google, Apple, or Facebook), we will receive basic profile info from that account, such as your name and email, as authorized by you.</li>
                    <li><strong>Service Providers:</strong> If you make a purchase, our payment processor might send us confirmation of payment. If we integrate a feature with a partner (for example, booking a third-party tour or event through Gamana), that partner may share information about your booking with us.</li>
                    <li><strong>Advertising Partners:</strong> We might receive analytics or audience information from marketing partners to understand the effectiveness of our ads (e.g. an ad network may tell us how many users installed the app after clicking an ad).</li>
                    <li><strong>Public Sources:</strong> We do not actively collect personal data from public databases, but if you publicly mention "Gamana" on social media and tag us, we might see your post. We will handle any such information according to this Policy.</li>
                  </ul>
                  <p className="leading-relaxed mt-4">
                    We will only use third-party data in accordance with the consent or permissions you have given and as permitted by law.
                  </p>
                </div>

                {/* Section 4 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Our Purposes for Using Your Personal Data</h2>
                  <p className="leading-relaxed mb-4">
                    We use your information to provide, maintain, and enhance Gamana's services, and to fulfill specific purposes, as detailed below:
                  </p>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">4.1 To Provide the Core Service:</h3>
                  <p className="leading-relaxed mb-3">
                    We process data to run the fundamental features of our app. This includes using your location to deliver GPS-triggered audio tours and real-time navigation on the map, enabling the AI narrators and content generation tailored to your current location, and providing the hands-free audio experience. For example, we use your precise GPS coordinates to determine when you approach a point of interest so we can automatically play the relevant story or insight at the right moment. We use your device data to ensure the app functions properly on your phone model and to deliver audio in the correct format (text-to-speech conversion, etc.). Essentially, all the features you expect – from starting a tour, hearing narration, viewing maps, to using voice commands – require processing of certain personal data. This processing is generally based on contractual necessity (to deliver the service you signed up for) and your consent (for location and any other permissions you grant). Without this data, the app may not work as intended.
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">4.2 To Personalize Your Experience:</h3>
                  <p className="leading-relaxed mb-3">
                    Gamana uses AI to suggest tours and stories and recommendations for you. We use your data to customize the tours and suggestions you see. For instance, based on your listening history and saved favorites, we might recommend new audio tours or points of interest that align with your interests. Over time, Gamana learns your preferences – if you often explore art museums, the app might highlight nearby art-related tours. If you usually choose a particular narrator persona or language, we'll remember that and make it the default for you. We also adjust content delivery; for example, if we notice you always use a certain volume level or prefer certain accessibility features, we strive to accommodate those preferences. This personalization is achieved through automated processing (profiling) of your engagement data, but no automated decision has legal or significant effects on you – it's only to enhance your enjoyment (see Section 8 on AI and automated decisions). You can influence personalization by adjusting settings or preferences (e.g., you can reset your recommendations or opt out of certain personalized features by contacting us).
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">4.3 To Improve and Analyze Our Services:</h3>
                  <p className="leading-relaxed mb-3">
                    We continually work to make Gamana better. We use collected data to understand how users interact with our app and identify areas for improvement. For example, we analyze usage patterns to see which tours are most popular or where users might drop off in a tour, so we can enrich content in the future. Crash logs and error reports are used to debug and ensure the app runs smoothly on all devices. Analytics data (largely in aggregate form) helps us optimize performance, such as improving loading times or reducing battery usage. We may conduct research and surveys – if you choose to participate in a survey or beta program, we will use your feedback to refine features and fix issues. Our legitimate interests in maintaining and developing our service form the legal basis for these uses (in jurisdictions that require it), and we implement measures to protect your privacy, such as aggregating data or using pseudonyms where feasible.
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">4.4 To Communicate with You:</h3>
                  <p className="leading-relaxed mb-3">We use contact information to stay in touch, both for service-related and promotional purposes. This includes:</p>
                  <ul className="list-disc pl-6 space-y-2 mb-3">
                    <li><strong>Essential Communications:</strong> We may send you transactional emails or notifications about your account or use of the service – for example, a welcome email, receipts or invoices for purchases, alerting you of important updates or changes to the app, responses from our support team, or notifications about changes to this Privacy Policy. These are necessary communications as part of our service to you.</li>
                    <li><strong>Announcements and Tips:</strong> With your consent (where required), we might send newsletters or in-app notifications about new tours, narrators, or features that we think you'll enjoy (e.g., "New audio tour available in London!"). We may also send travel tips or content related to your interests if you subscribed to such updates.</li>
                    <li><strong>Promotional Offers:</strong> Occasionally, we could inform you of promotions, such as limited free upgrades or referral rewards. If you're on our free plan, we might let you know about premium features you can trial.</li>
                  </ul>
                  <p className="leading-relaxed">
                    You have control over marketing messages – you can unsubscribe from emails via the "unsubscribe" link, or adjust your notification preferences in the app. We will only send marketing communications in accordance with your preferences and applicable law (e.g., we won't send promotional SMS without consent, and EU/UK users will only get marketing emails if they've opted in). Even if you opt out of marketing, you will still receive essential service messages as noted above.
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">4.5 To Provide Customer Support:</h3>
                  <p className="leading-relaxed">
                    If you reach out to us with questions, feedback, or troubleshooting needs, we will use your information to help you. This may involve accessing your account details or usage logs to diagnose an issue you reported, or reviewing the content of your support request. We might ask for additional information if needed to resolve your case (for example, what device OS version you have). All support communications are handled with care and used only for assisting you.
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">4.6 For Safety and Security:</h3>
                  <p className="leading-relaxed">
                    Your data is used to keep the app and our users secure. We monitor and use certain data to prevent fraud, detect abuse, and ensure security. For example, we may use IP address and other device identifiers to detect suspicious login attempts or multiple accounts abuse. Location data may be used to support safety features – for instance, if you trigger an SOS alert, we use your location to facilitate assistance. We also enforce our Terms of Service; if we detect behavior that violates our rules (like hacking attempts or inappropriate content submissions), we may take action which could include analyzing relevant account data and possibly sharing information with law enforcement if someone's safety is at risk. These security-related processes are based on legal obligations and our legitimate interest in protecting our platform and users.
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">4.7 Legal Compliance:</h3>
                  <p className="leading-relaxed">
                    We process personal data as necessary to meet our legal obligations. This includes maintaining records required for finance or tax laws (e.g., keeping purchase records), honoring your data requests under privacy laws, and complying with any lawful requests by public authorities. If we are under a legal duty to disclose data (such as a court order or law enforcement request), we will only do so after verifying the request's validity and scope. We may notify you of such requests when permitted. Additionally, if needed, we will use your data to exercise or defend legal claims. For example, if there is a dispute or litigation, we might preserve and use relevant data as evidence.
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">4.8 Other Purposes (with Notice):</h3>
                  <p className="leading-relaxed">
                    If we intend to use your personal information for a purpose not covered in this Policy, we will update this Policy or provide you with a separate notice explaining that use. We will also obtain consent when required. We will not engage in any uses of your data that are incompatible with the purposes described above without informing you.
                  </p>

                  <p className="leading-relaxed mt-4 p-4 bg-gray-50 rounded-lg">
                    <strong>Legal Bases (EU/UK users):</strong> For those in the EU, UK, and similar jurisdictions, we want you to know that we rely on the following legal grounds for processing your data: (i) Consent – for example, for accessing precise GPS location, sending marketing communications, or placing non-essential cookies; (ii) Contract – processing necessary to provide the services you request as outlined in our Terms (like delivering audio content based on location, or managing your account); (iii) Legal Obligation – complying with laws and regulations; and (iv) Legitimate Interests – for our internal improvement, security, and support, as long as those interests are not overridden by your data protection rights. Where we rely on legitimate interests, we have balanced them against your privacy and put safeguards in place. You always have the right to object to processing based on legitimate interests (see Section 2).
                  </p>
                </div>

                {/* Section 5 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">5. How We Share or Disclose Your Data</h2>
                  <p className="leading-relaxed mb-4">
                    We understand the importance of your personal data, and we only share it in ways that are necessary and described below. We do not sell your personal information to third parties for money. When we do share data, we take steps to protect it via contracts and security measures.
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">5.1 Service Providers (Processors):</h3>
                  <p className="leading-relaxed mb-3">We use trusted third-party companies to help us operate Gamana, and we may share information with them as needed for their services. These third parties process data on our behalf and are bound by confidentiality and data protection agreements. Key categories include:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Cloud Hosting & Storage:</strong> We rely on cloud infrastructure to store and manage data (for example, user account info and content). These providers store data securely and only access it for maintenance or at our instruction.</li>
                    <li><strong>Mapping & Location Services:</strong> Gamana integrates map services (e.g., Google Maps or Mapbox) to provide navigation and location visuals. When you use mapping features, basic location coordinates or map requests may be shared with that service to render the map or route. We only share what is necessary (such as GPS coordinates for map tiles) and not your identity.</li>
                    <li><strong>AI and Content Services:</strong> To generate AI-powered audio content and narrations, we may use specialized AI platforms or text-to-speech engines. For instance, we could send a piece of text to a text-to-speech service to produce the audio narration in your chosen voice. These services may receive contextual data (like location-related text for content generation) but not more than needed to produce the feature.</li>
                    <li><strong>Analytics Services:</strong> We use analytics tools (e.g., Google Analytics, Mixpanel) to collect usage data and metrics. These tools may set cookies or SDKs in our app/website to gather information like app events, page visits, and technical info. All usage data shared is typically aggregated or anonymized. This helps us understand user behavior and improve our product.</li>
                    <li><strong>Communication Tools:</strong> We may use email service providers or push notification services to send messages (for example, SendGrid for emails or Firebase for push notifications). They will process your contact info and message content solely to deliver our communications to you.</li>
                    <li><strong>Payment Processors:</strong> If applicable, our payment processing partners (such as Apple, Google, or Stripe) handle your financial transactions. They receive the necessary personal data to process payments (like your card info or app store ID). We receive limited info back from them (such as transaction confirmations or subscription status) as needed for record-keeping or enabling premium features.</li>
                    <li><strong>Customer Support Platforms:</strong> We might use a support ticketing system or chat service to manage help requests. If so, that platform will process whatever support information you provide (like your email and the issue details) to help us track and respond to your inquiry.</li>
                  </ul>
                  <p className="leading-relaxed mt-4">
                    We ensure that each service provider can only access the data needed for their specific task and cannot use it for other purposes. They must also comply with privacy laws (for example, we sign Data Processing Agreements including GDPR-standard clauses with providers who handle EU data).
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">5.2 Business Partners and Integrations:</h3>
                  <p className="leading-relaxed mb-3">In some cases, Gamana may partner with third parties or offer integrations that you choose to use:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>If you take advantage of a special offer in the app that involves a third party (for example, a discount on a partner's travel service), we would share the minimum data required to fulfill that offer only with your knowledge.</li>
                    <li>If in the future we have a feature where you can purchase third-party tours or experiences through Gamana, we will clearly inform you of any data that needs to be shared with that third party (such as your name or contact info for booking) and get your consent.</li>
                    <li>If you link Gamana with another service (say, connecting your account to a social network for sharing achievements), we will share data at your direction, and likewise receive data as described in Section 3.c.</li>
                  </ul>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">5.3 Advertising and Marketing:</h3>
                  <p className="leading-relaxed">
                    If you are using the free version of Gamana, we may display ads to you to support our service (noting that premium users have an ad-free experience). These ads could be served by third-party advertising networks. To make ads more relevant and measure their effectiveness, we might share certain information with ad partners, such as device identifiers or general location (e.g., city-level) and usage info. For example, we might allow an ad network to collect identifiers via cookies or SDKs to show you an ad for Gamana on another website, or to show travel-related ads within our app. We do not share information that directly identifies you (like your name or email) with third-party advertisers; they mainly receive pseudonymous data. However, such data sharing for targeted advertising might be considered a "sale" or "sharing" of personal info under California law. If you are a California resident, you can opt out of this (see Section 11.2). All users can control advertising cookies via our cookie consent tool or device settings. If required, we will obtain consent for advertising cookies (for instance, in the EU/UK).
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">5.4 Legal Disclosures:</h3>
                  <p className="leading-relaxed">
                    We may disclose your information if we are compelled to do so by law or legal process, or if we have a good faith belief that such disclosure is necessary to: (i) comply with a legal obligation, court order, or governmental request; (ii) enforce our Terms of Service or other agreements; (iii) protect the rights, property, or safety of Gamana, our users, or the public. For example, if law enforcement provides a lawful subpoena for data in an investigation, we may be required to provide the requested information. We will attempt to notify you of such requests when allowed, and will only provide the minimum data necessary. Additionally, if you engage in behavior that threatens the safety of others or our platform (such as fraudulent activities), we may share data with appropriate authorities to address the issue.
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">5.5 Business Transfers:</h3>
                  <p className="leading-relaxed">
                    If Gamana or Siar Labs is involved in a merger, acquisition, financing due diligence, reorganization, bankruptcy, receivership, sale of company assets, or transition of service to another provider, your information may be transferred as part of that transaction. If such a transfer occurs, your personal data would remain subject to the promises made in this Privacy Policy (unless you're notified otherwise and consent to any new terms). We will notify you (for example, via email or a prominent notice on our app/website) of any change in ownership or use of your personal information, as well as any choices you may have regarding your personal information as a result of the transfer.
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">5.6 With Your Consent:</h3>
                  <p className="leading-relaxed">
                    Apart from the situations above, we will share your personal data with third parties only if you ask us to or explicitly consent (on a case-by-case basis). For instance, if you opt in to a research study or beta program that involves data sharing, or if you instruct us to share data with a third-party app, we will do so under the conditions you agreed to.
                  </p>

                  <p className="leading-relaxed mt-4 p-4 bg-gray-50 rounded-lg">
                    <strong>Summary:</strong> We are careful about how and with whom we share your info. When we do share data, we ensure it's protected and used only for legitimate purposes as described. We do not sell your data for profit, and we do not share with third parties for their own independent marketing use without your consent. If you have questions about any specific third party we work with, feel free to contact us.
                  </p>
                </div>

                {/* Section 6 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
                  <p className="leading-relaxed mb-4">
                    We keep your personal data only as long as necessary to fulfill the purposes for which it was collected, or as required by law. Retention periods vary depending on the type of data and how we use it:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Account Information:</strong> We retain your account data (like your profile info, settings, and preferences) for as long as your account is active. If you delete your account or request deletion, we will remove or anonymize your personal information from our active databases, barring information we must keep for legal or operational reasons. Basic account records (e.g., email, account creation date) may be kept in backups for a short period or as required to demonstrate compliance.</li>
                    <li><strong>Location & Usage Data:</strong> Detailed location history and usage logs are retained only as long as needed for the purposes described. For example, raw GPS traces might be kept for a limited time (as noted in our GDPR statement, we might retain location data up to 2 years) to improve recommendations, after which they are deleted or de-identified. Aggregated analytics (which no longer identify you) may be retained indefinitely to analyze long-term trends.</li>
                    <li><strong>Transaction Data:</strong> Purchase and subscription records are kept to fulfill accounting and tax obligations. Financial records generally must be kept for a number of years (e.g., 7 years under some laws) – we store minimal personal data in these records, usually just what's necessary (like an email or user ID associated with a purchase).</li>
                    <li><strong>Communication Records:</strong> Any support emails or communications you send us are retained as long as needed to address your query and for a short while after to allow us to reference past issues if you contact us again. We may purge old support tickets periodically if not needed.</li>
                    <li><strong>Emergency Contact/SOS Data:</strong> If you provided emergency contact info, it is kept until you remove or update it, or until your account is deleted.</li>
                    <li><strong>Cached Audio Content:</strong> Audio files downloaded or cached on your device for offline use remain on your device until you remove them or as the app's cache policy dictates. Cached content may auto-delete after a certain period or when storage is low. This cached data on your device can also be cleared by uninstalling the app.</li>
                  </ul>
                  <p className="leading-relaxed mt-4">
                    When we no longer have a legitimate need to retain your personal information, we will securely delete or anonymize it. If deletion is not immediately possible (for example, because the data is stored in backups), we will ensure it is isolated and protected until deletion is feasible.
                  </p>
                  <p className="leading-relaxed mt-4">
                    <strong>Exceptions:</strong> There are scenarios where we might keep data longer than usual, such as:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>To comply with law or regulatory requirements (e.g., retention of records for financial audits, or preserving data if we receive a legal hold notice in litigation).</li>
                    <li>If there's an unresolved issue, dispute, or legal claim, we may retain relevant information until it is resolved.</li>
                    <li>To enforce our rights, agreements, or to prevent fraud or abuse, we might retain data necessary to show our actions were proper (for instance, keeping logs of abusive behavior that led to an account ban).</li>
                  </ul>
                  <p className="leading-relaxed mt-4">
                    In all cases, our goal is to minimize retention and not keep personal data indefinitely. We regularly review our databases and securely erase data that is no longer needed.
                  </p>
                </div>

                {/* Section 7 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Transfer of Data to Other Countries</h2>
                  <p className="leading-relaxed mb-4">
                    Gamana is used by travelers and users around the world. Accordingly, your personal information may be transferred to and processed in countries other than your own. Our servers and offices are primarily located in the United States, but we may also use cloud providers or service partners in other regions, such as the European Economic Area (EEA) or India, to operate the service.
                  </p>
                  <p className="leading-relaxed mb-4">
                    While data protection laws vary by country, we take measures to ensure that your data remains protected according to the standards of this Privacy Policy regardless of location. If you are located in the EEA, UK, India, or other regions with data transfer restrictions, we implement appropriate safeguards for cross-border data transfers:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Standard Contractual Clauses (SCCs):</strong> For transfers from the EEA/UK to the U.S. or other countries not deemed "adequate" by the EU, we rely on European Commission-approved Standard Contractual Clauses and equivalent UK transfer addendums as needed. These contractual obligations require the recipient to protect your data to EU GDPR standards.</li>
                    <li><strong>International Frameworks:</strong> We may also rely on frameworks like the EU-U.S. Data Privacy Framework (if our company self-certifies to it in the future) or any adequacy decisions (if a country is officially deemed to have adequate protection).</li>
                    <li><strong>Indian Law Compliance:</strong> For data transfers from India, we follow the DPDP Act and any rules or whitelists issued by the Indian government regarding cross-border data transfer. We will ensure that your data is not sent to any country or entity barred by the Indian authorities, and that equivalent protection measures are in place.</li>
                    <li><strong>Other Measures:</strong> We conduct due diligence on our service providers in other countries to ensure they have strong security and privacy practices. We also consider supplemental measures like encryption in transit and at rest (so that data is secure even during transfer).</li>
                  </ul>
                  <p className="leading-relaxed mt-4">
                    You acknowledge that personal data may be processed in countries which may have different or less stringent data protection laws than your country. However, we will always protect your information in accordance with this Policy. If you have questions about international data transfers or need more details about our safeguards, please contact us (see Section 12).
                  </p>
                </div>

                {/* Section 8 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Keeping Your Data Safe</h2>
                  <p className="leading-relaxed mb-4">
                    Security is a top priority for us. We have implemented a variety of technical and organizational measures to protect your personal data from unauthorized access, use, alteration, or destruction. Here are some of the key safeguards we use:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Encryption:</strong> We use encryption to protect data in transit and at rest. For example, any data exchanged between your device and our servers is secured using TLS/SSL encryption (HTTPS), which protects it from eavesdropping. Sensitive data stored on our servers (including personal info and passwords) is encrypted at rest (we follow industry standards like AES-256 encryption for storage).</li>
                    <li><strong>Access Controls:</strong> We limit access to personal data strictly to employees and contractors who need it to operate, develop, or support the service. Access is controlled via authenticated accounts, and wherever possible we use multi-factor authentication. We follow the principle of least privilege, meaning each person is granted the minimum access necessary for their role.</li>
                    <li><strong>Secure Authentication:</strong> If you create a Gamana account, your password is stored hashed (not in plain text). We encourage you to choose a strong password. For certain logins, we may offer OAuth (Third-party sign-in) or token-based authentication for added security.</li>
                    <li><strong>Network & System Security:</strong> Our servers are protected by firewalls and network monitoring to guard against intrusions. We keep our software and infrastructure updated with security patches. We also employ anti-malware and monitoring tools to detect and block suspicious activities.</li>
                    <li><strong>Testing and Audits:</strong> We perform regular security audits and penetration testing, either internally or with the help of external specialists. Vulnerabilities, if found, are promptly addressed. We also comply with security standards – as noted on our site, we are SOC 2 compliant, which means our controls have been audited for security, availability, and confidentiality.</li>
                    <li><strong>Training and Policies:</strong> Our team members are trained on data protection best practices and are required to follow our internal security policies. This includes proper data handling procedures and reporting any suspected incidents.</li>
                    <li><strong>Pseudonymization:</strong> Where feasible, we pseudonymize or anonymize data. For example, analytics may be kept in aggregate form without directly identifying users. If we use production data for testing, we remove personal identifiers.</li>
                  </ul>
                  <p className="leading-relaxed mt-4">
                    Despite all these measures, it's important to note that no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security. In the unlikely event of a data breach that poses a significant risk to your rights (for instance, a leak of personal data), we will notify you and the appropriate authorities as required by law. For example, under GDPR we would inform the supervisory authority and users of certain breaches within 72 hours. We also continuously evaluate new security technologies and threats to update our protections.
                  </p>
                  <p className="leading-relaxed mt-4">
                    <strong>Your responsibility:</strong> You also play a role in keeping your data safe. Please maintain the confidentiality of your account credentials and do not share them. If you suspect any unauthorized access to your account or any security vulnerabilities, contact us immediately.
                  </p>
                </div>

                {/* Section 9 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
                  <p className="leading-relaxed mb-4">
                    Gamana is not intended for children under the age of 13. We do not knowingly collect personal information from anyone under 13 years old without verifiable parental consent. Our services and content are generally aimed at a general audience of travelers and adults.
                  </p>
                  <p className="leading-relaxed mb-4">
                    If you are a parent or guardian and believe that your child under 13 has provided personal data to us (for example, created an account or otherwise), please contact us immediately. We will take prompt steps to delete that information from our records.
                  </p>
                  <p className="leading-relaxed mb-4">
                    <strong>For minors above 13:</strong>
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Teens (13-17):</strong> If you are between 13 and the age of legal majority in your jurisdiction, you should use Gamana under the supervision of a parent or guardian, and with their consent to this Policy. Some features (like purchases) may require adult involvement. If you are in the EU/UK, note that GDPR requires parental consent for processing personal data of children under 16 in many cases – we do not knowingly offer our services directly to children under 16 in the EU without such consent.</li>
                  </ul>
                  <p className="leading-relaxed mt-4">
                    If we learn that we have inadvertently collected personal information from a child under the minimum applicable age without proper consent, we will delete that information as quickly as possible. We are committed to complying with children's privacy regulations such as COPPA (Children's Online Privacy Protection Act in the U.S.) and similar laws worldwide. If you have any concerns about your child's data, please reach out to us via the contact information in Section 12.
                  </p>
                </div>

                {/* Section 10 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
                  <p className="leading-relaxed mb-4">
                    We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal requirements, or for other operational reasons. If we make material changes, we will notify you in an appropriate manner, for example by:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Posting the updated policy on our website and app, with a new "Last Updated" date at the top.</li>
                    <li>For significant changes, providing a prominent notice in the app or on the website (such as a pop-up or banner), and/or sending you an email notification if we have your email on file.</li>
                  </ul>
                  <p className="leading-relaxed mt-4">
                    We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information. If you continue to use Gamana after a revised Privacy Policy has become effective, you are deemed to have accepted the updated terms. Where required by law (for instance, if a change involves new data uses that require consent), we will obtain your consent.
                  </p>
                  <p className="leading-relaxed mt-4">
                    If you do not agree to any updates to the Policy, you should stop using our services and may request that we delete your data.
                  </p>
                </div>

                {/* Section 11 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">11. Regional Privacy Notices</h2>
                  <p className="leading-relaxed mb-4">
                    We strive to comply with privacy laws in all jurisdictions where we operate. Below are additional details and rights that may apply based on your residency:
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">11.1 European Union/United Kingdom (GDPR/UK GDPR)</h3>
                  <p className="leading-relaxed mb-3">
                    If you are in the EU, EEA, or UK, the General Data Protection Regulation (GDPR) and UK data protection laws provide you certain rights (many of which have been outlined in Section 2). In addition to those:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You have the right to object to processing of your data in some cases, such as processing based on legitimate interests or for direct marketing. If you object, we will consider if we have compelling grounds to continue (permitted by law); otherwise we will cease the processing.</li>
                    <li>You have the right to restrict processing, for example while we verify your data correction requests or if you want to prevent erasure but limit use of the data.</li>
                    <li>You have the right to lodge a complaint with a Data Protection Authority (DPA) in the EU or the UK's Information Commissioner's Office (ICO) if you believe we have infringed your privacy rights. We would appreciate the chance to address your concerns first, so please feel free to contact us.</li>
                  </ul>
                  <p className="leading-relaxed mt-4">
                    We have appointed SIARLabs LLC as the Data Controller for EU/UK data. Our contact details are in Section 12. We have also designated a Data Protection Officer (see Section 13). Transfers of personal data out of the EU/UK are protected by SCCs as noted in Section 7.
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">11.2 California, USA (CCPA/CPRA)</h3>
                  <p className="leading-relaxed mb-3">
                    If you are a California resident, you are protected by the California Consumer Privacy Act (as amended by the California Privacy Rights Act). In addition to the information provided throughout this Policy about what data we collect, use, and share, note the following key points and rights under CCPA/CPRA:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Categories of Personal Information:</strong> In the last 12 months, we may have collected the following categories of personal information (as defined by CCPA) about you: Identifiers (e.g., name, email, device IDs), Geolocation data (precise location from GPS), Internet or electronic activity (app usage, log data), Audio information (voice commands, tour audio engagement), and Inferences drawn from the above (to create a profile about preferences). We collect these for the business and commercial purposes described in Section 4.</li>
                    <li><strong>"Sale" and "Sharing" of Data:</strong> We do not sell personal information for money. We also do not share your information for cross-context behavioral advertising except as described for advertising cookies/partners in Section 5.3. If we engage in any activity that falls under "sharing" (e.g., allowing third-party ad cookies that collect your info for personalized ads), you have the right to opt-out. We honor Do Not Sell or Share requests. You can exercise this by using the "Your Privacy Choices" link or toggle on our website (if available) or by contacting us to opt out of advertising cookies. We also recognize Global Privacy Control (GPC) signals from browsers as an opt-out of sale/sharing, as required by law.</li>
                    <li><strong>Right to Know:</strong> You can request that we disclose the specific pieces of personal information we have about you, as well as categories of information, sources, purposes, and third parties we share with. We will provide this information for the 12-month period preceding your request, free of charge, up to twice per year.</li>
                    <li><strong>Right to Delete:</strong> You can request deletion of your personal information that we have collected about you. There are some exceptions (if the data is needed for a legal purpose or for a reason allowed by CCPA, we will let you know). If you ask for deletion, we will also instruct our service providers to delete your info from their records, where required.</li>
                    <li><strong>Right to Correct:</strong> You can request that we correct inaccurate personal information we hold about you. We will take into account the nature of the information and purpose of processing and work to correct it accordingly (or allow you to do so).</li>
                    <li><strong>Right to Limit Use of Sensitive Personal Information:</strong> We do not use or disclose sensitive personal information (such as precise geolocation, which is considered sensitive under CPRA) for purposes other than providing the services you requested or as otherwise allowed by law. We only use your precise GPS to provide the Gamana service (navigation, content) and for security/emergency features, which are considered "necessary" purposes. We do not use sensitive data to infer characteristics about you or for unrelated secondary purposes. Therefore, the right to limit use of sensitive info is not applicable unless we change our practices. If we ever expand use of sensitive data, we will provide a "Limit Use of My Sensitive Personal Info" option.</li>
                    <li><strong>Authorized Agent:</strong> You may designate an authorized agent to make requests on your behalf. We will take steps to verify the agent's authority and your identity before fulfilling requests.</li>
                    <li><strong>No Discrimination:</strong> We will not deny goods or services, charge different prices, or provide a different level of quality because you exercised your CCPA rights. If you are a free user and opt out of sharing data for ads, you will still have access to the free service – at most, you'll just see non-personalized ads.</li>
                  </ul>
                  <p className="leading-relaxed mt-4">
                    To exercise any of these California rights, please use the contact methods in Section 12. For verification, we may ask you to provide information that matches our records (like confirming your email or a recent tour you took). For requests to know or delete, we require a reasonably high degree of certainty regarding your identity (and higher certainty for specific pieces of data). If you have a password-protected account, we will use that authentication. Otherwise, we may ask for at least two data points of verification.
                  </p>
                  <p className="leading-relaxed mt-4">
                    We have provided the above disclosures to summarize your California privacy rights. You can also view this information in a more formal notice format on our website (see "Notice at Collection" link if available, pursuant to CCPA).
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">11.3 India (Digital Personal Data Protection Act 2023)</h3>
                  <p className="leading-relaxed mb-3">
                    If you are using Gamana from India, the Digital Personal Data Protection Act, 2023 (DPDP) provides you with certain rights and we adhere to its requirements:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Consent and Withdrawal:</strong> We will seek your consent before processing personal data, especially for any non-obvious uses. For example, by allowing location access or signing up, you consent to those uses. You have the right to withdraw consent at any time – for instance, you can turn off location access or unsubscribe from marketing, and we will stop the related data processing. Withdrawal of consent will not affect processing done prior to withdrawal.</li>
                    <li><strong>Right to Access Information:</strong> You can request a summary of the personal data we have about you and how we have processed it. We provide much of this information in this Privacy Policy and will additionally answer any specific queries you have about your data.</li>
                    <li><strong>Right to Correction and Erasure:</strong> You may ask us to correct, update, or complete your personal data if it is inaccurate or misleading. You may also request the erasure of your data. Upon verification and if reasonable, we will make the corrections or delete the data (unless retention is required for legal reasons, similar to the principles in Section 6).</li>
                    <li><strong>Grievance Redressal:</strong> We have a dedicated contact for addressing your complaints and concerns regarding data privacy. If you have a grievance about how we handle your data, you can contact our Grievance Officer (or Data Protection Officer, see Section 13). We will acknowledge and resolve grievances within the timelines prescribed by the DPDP regulations. If you are not satisfied with the resolution, you have the right to file a complaint with the Data Protection Board of India. We will provide you with details on how to do so if needed.</li>
                    <li><strong>Right to Nominate:</strong> You have the right to nominate a representative to exercise your data rights on your behalf in case of death or incapacity. If you choose to do so, please inform us in writing of the nominee's details and authorization.</li>
                    <li><strong>Children:</strong> In India, users under 18 are considered minors. We do not process personal data of children without consent of their parent or lawful guardian. If a minor (under 18) uses Gamana, a parent/guardian must review and consent to this Privacy Policy. We also ensure that we do not undertake any tracking or targeted advertising directed at minors' data in compliance with the DPDP Act. Parental consent features in our family plan help facilitate this.</li>
                    <li><strong>Data Security & Storage:</strong> We comply with the DPDP's requirements for data security and will notify the Data Protection Board and users of any breaches as mandated. Personal data of Indian users may be stored in servers located in the U.S. or other countries as explained in Section 7, but always in line with Indian government's whitelisting and transfer rules. We take reasonable safeguards as required under DPDP to prevent personal data breaches and have implemented policies accordingly.</li>
                  </ul>
                  <p className="leading-relaxed mt-4">
                    We are committed to complying with the DPDP Act. This includes ensuring that any significant data fiduciary obligations (if we ever qualify as one) like data audits and local storage (if mandated) are fulfilled. We also make sure that third parties processing data on our behalf are bound to similar compliance.
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">11.4 Other Jurisdictions</h3>
                  <p className="leading-relaxed">
                    For users in other regions (Canada, Australia, Brazil LGPD, etc.), we also respect your rights under applicable laws. For example, Canadian users can request information and withdraw consent under PIPEDA. Australian users' data is handled in accordance with the Australian Privacy Principles (APPs). Brazilian users have rights under the LGPD similar to GDPR (access, correction, deletion, etc.), which we honor. If you have any specific locale-based request or question, please contact us. We aim to "comply with applicable privacy laws in all jurisdictions where we operate".
                  </p>
                </div>

                {/* Section 12 */}
                <div className="bg-gray-50 rounded-lg p-8 mt-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">12. How to Contact Us</h2>
                  <p className="leading-relaxed mb-4">
                    If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please do not hesitate to contact us. We're here to help.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-[#159895] mt-1" />
                      <div>
                        <p className="font-semibold">Email</p>
                        <p className="text-sm text-gray-600 mb-2">You can reach our privacy team at <a href="mailto:support@gamana.app" className="text-[#159895] hover:underline">support@gamana.app</a>. This is the primary email for all data protection inquiries, including GDPR or DPDP requests.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-[#159895] mt-1" />
                      <div>
                        <p className="font-semibold">Postal Mail</p>
                        <p className="text-sm text-gray-600">SIARLabs LLC (Siar Labs) – 24 East Avenue #127, New Canaan, CT 06840, USA. (Attn: Privacy Officer)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-[#159895] mt-1" />
                      <div>
                        <p className="font-semibold">In-App Support</p>
                        <p className="text-sm text-gray-600">You may also contact us through the app's help/support section or via the web Contact Us form. Just mention that your inquiry is privacy-related, and it will be routed to the correct team.</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-300 space-y-2">
                      <p className="text-sm"><strong>For California Residents:</strong> You can also use <a href="mailto:support@gamana.app" className="text-[#159895] hover:underline">support@gamana.app</a> for CCPA-specific inquiries, or call our toll-free number if provided on our website (if applicable).</p>
                      <p className="text-sm"><strong>For EU/UK Residents:</strong> For any issues, you can reach out to <a href="mailto:support@gamana.app" className="text-[#159895] hover:underline">support@gamana.app</a> (our dedicated GDPR contact).</p>
                      <p className="text-sm"><strong>For India Residents:</strong> You may email <a href="mailto:support@gamana.app" className="text-[#159895] hover:underline">support@gamana.app</a> with "Grievance – [Your Issue]" in the subject line to reach our Grievance Officer.</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                      We will respond to your inquiries as soon as reasonably possible, and at latest within the timeframe required by law. If you contact us, we may need to verify your identity for security, especially for requests regarding personal data access or deletion.
                    </p>
                  </div>
                </div>

                {/* Section 13 */}
                <div className="bg-gray-50 rounded-lg p-8 mt-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">13. Data Protection Officer</h2>
                  <p className="leading-relaxed mb-4">
                    We have appointed a Data Protection Officer (DPO) in accordance with certain laws (like GDPR) to oversee our privacy practices and serve as a point of contact for data protection matters.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-[#159895] mt-1" />
                      <div>
                        <p className="font-semibold">DPO Contact:</p>
                        <a href="mailto:ananth@gamana.app" className="text-[#159895] hover:underline">
                          ananth@gamana.app
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-[#159895] mt-1" />
                      <div>
                        <p className="font-semibold">Mailing Address:</p>
                        <p className="text-sm text-gray-600">(same as above, Attn: Data Protection Officer)</p>
                      </div>
                    </div>
                  </div>
                  <p className="leading-relaxed mt-4">
                    Our DPO (or designated privacy officer) is responsible for monitoring our compliance with this Privacy Policy and applicable data protection laws. They are involved in evaluating the impact of new projects on privacy and training our staff. If you have a complex or sensitive concern that you feel has not been resolved through normal channels, you may contact the DPO directly.
                  </p>
                </div>

                {/* Closing Note */}
                <div className="border-t border-gray-200 pt-8 mt-12 text-center">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Thank you for reading our Privacy Policy. We value your trust and are committed to protecting your personal data while while you use the app. Safe travels and happy exploring with Gamana!
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
