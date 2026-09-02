import { Button } from "@/components/ui/button";

export const SEOBlock = () => {
    return (
        <section className="py-16 md:py-20 bg-card border-t border-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-foreground">
                    Audio Travel Guide Cities Covered by Gamana
                </h2>
                <div className="prose prose-slate dark:prose-invert prose-sm max-w-none text-muted-foreground">
                    <p>
                        Gamana is rapidly expanding its coverage to bring you the best <strong>audio travel guide</strong> experiences across the globe.
                        Our <strong>audio city tours</strong> are designed to help you explore without staring at a screen. Whether you are wandering through
                        the historic streets of Rome or the neon-lit alleys of Tokyo, our <strong>walking audio experiences</strong> provide context, history,
                        and local stories right in your ear.
                    </p>
                    <p>
                        We focus on <strong>supported travel cities</strong> where walking is the best way to find the streets and stops worth walking. Unlike traditional guidebooks,
                        Gamana offers a hands-free, heads-up way to travel. Auto-playing audio ensures you never miss a story as you pass by landmarks.
                    </p>
                </div>
            </div>
        </section>
    );
};

export const FinalCTA = () => {
    return (
        <section className="py-16 md:py-20 bg-background relative overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#159895]/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1A5F7A]/5 rounded-full blur-3xl"></div>
                {/* Travel icons in CTA */}
                <div className="absolute top-16 left-[8%] opacity-10">
                    <img src="/Picture8.png" alt="" width={70} height={70} className="drop-shadow-lg" />
                </div>
                <div className="absolute bottom-16 right-[10%] opacity-10">
                    <img src="/Picture6.png" alt="" width={75} height={75} className="drop-shadow-lg" />
                </div>
            </div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[62px] font-black mb-6 text-foreground leading-tight">
                        Ready to extract the <span className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] bg-clip-text text-transparent">city differently?</span>
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
                        Join travellers who explore cities with Gamana in their ears
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a
                        href="https://play.google.com/store/apps/details?id=com.agent.gamana.ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:scale-105 transition-transform"
                    >
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                            alt="Download Gamana on Android"
                            className="h-16 w-auto"
                        />
                    </a>
                    <a
                        href="https://apps.apple.com/in/app/gamana-ai/id6748155654"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:scale-105 transition-transform"
                    >
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                            alt="Download Gamana on iOS"
                            className="h-16 w-auto"
                        />
                    </a>
                </div>
            </div>
        </section>
    );
};
