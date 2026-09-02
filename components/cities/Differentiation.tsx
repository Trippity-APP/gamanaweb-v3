import { Headphones, Route, Sparkles, MapPin } from "lucide-react";

const features = [
    {
        icon: Headphones,
        title: "Audio-first exploration",
        description: "Designed for listening, not reading on a screen.",
    },
    {
        icon: Route,
        title: "Auto-plays as you walk",
        description: "Stories trigger automatically at the right spot.",
    },
    {
        icon: Sparkles,
        title: "Story-rich narration",
        description: "Stories written for the exact spot you're standing on.",
    },
    {
        icon: MapPin,
        title: "Built for real travel moments",
        description: "Enhances your journey without distracting you.",
    },
];

export const Differentiation = () => {
    return (
        <section className="py-16 md:py-20 bg-[#1A5F7A] text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-12 md:mb-14">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                        Why Exploring Cities with Gamana Feels Different
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center text-center group">
                            <div className="w-14 h-14 rounded-full bg-[#159895]/20 flex items-center justify-center mb-5 text-[#57C5B6] group-hover:bg-[#159895]/30 transition-colors duration-300">
                                <feature.icon className="w-7 h-7" strokeWidth={2} />
                            </div>
                            <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
                            <p className="text-white/80 leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
