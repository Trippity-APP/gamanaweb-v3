export interface City {
    id: string;
    name: string;
    country: string;
    description: string;
    tags: string[]; // "History", "Culture", "Food", "Walking", "Nature"
    image: string; // Placeholder for now
    details: {
        intro: string;
        highlights: string[];
        languages: string[];
    };
    isNew?: boolean;
    isPopular?: boolean;
}

export const cities: City[] = [
    {
        id: "goa",
        name: "Goa",
        country: "India",
        description: "Sun, sand, and Portuguese heritage.",
        tags: ["Culture", "History", "Relaxation", "Walking"],
        image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=2874&auto=format&fit=crop",
        isPopular: true,
        details: {
            intro: "Goa is more than just beaches. Discover the UNESCO-listed churches of Old Goa, the colorful Latin Quarter of Fontainhas, and the vibrant spice plantations. A blend of Indian and Portuguese cultures awaits.",
            highlights: [
                "Old Goa Churches (Basilica of Bom Jesus)",
                "Fontainhas Latin Quarter",
                "Panjim City Walk",
                "Spice Plantation Tour"
            ],
            languages: ["English", "Konkani", "Hindi", "Portuguese"]
        }
    },
    {
        id: "kerala",
        name: "Kerala",
        country: "India",
        description: "God's Own Country – serene backwaters and heritage.",
        tags: ["Nature", "Culture", "History", "Relaxation"],
        image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=2832&auto=format&fit=crop",
        isPopular: true,
        details: {
            intro: "Experience the tranquility of Kerala. From the historic Fort Kochi with its Chinese fishing nets to the serene backwaters of Alleppey and the tea gardens of Munnar, our guides bring the diverse landscapes to life.",
            highlights: [
                "Fort Kochi Heritage Walk",
                "Alleppey Backwaters Tour",
                "Munnar Tea Gardens",
                "Jew Town & Synagogue"
            ],
            languages: ["English", "Malayalam", "Hindi"]
        }
    },
    {
        id: "bengaluru",
        name: "Bengaluru",
        country: "India",
        description: "The Silicon Valley of India with a royal past.",
        tags: ["Culture", "History", "Nature", "Walking"],
        image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=2942&auto=format&fit=crop",
        isNew: true,
        details: {
            intro: "Known as the Garden City, Bengaluru blends its colonial heritage with a vibrant tech scene. Walk through the lush Cubbon Park, admire the Tudor-style Bangalore Palace, and explore the bustling markets of K.R. Market.",
            highlights: [
                "Bangalore Palace & Grounds",
                "Cubbon Park Nature Walk",
                "Tipu Sultan's Summer Palace",
                "Lalbagh Botanical Garden"
            ],
            languages: ["English", "Kannada", "Hindi"]
        }
    },
    {
        id: "hampi",
        name: "Hampi",
        country: "India",
        description: "Ancient ruins of Vijayanagara.",
        tags: ["History", "Architecture"],
        image: "/cities/hampi.jpg",
        details: { intro: "Forgotten empire...", highlights: [], languages: ["English", "Kannada"] }
    },
    {
        id: "nyc",
        name: "New York City",
        country: "United States",
        description: "The concrete jungle where dreams—and stories—are made.",
        tags: ["Culture", "History", "Walking"],
        image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2924&auto=format&fit=crop",
        isPopular: true,
        details: {
            intro: "Feel the energy of New York City. From the bright lights of Times Square and Broadway to the quiet paths of Central Park and the historic streets of Greenwich Village, our audio guides capture the pulse of the city.",
            highlights: [
                "Central Park Walking Tour",
                "Times Square & Broadway",
                "Brooklyn Bridge Walk",
                "High Line Park"
            ],
            languages: ["English", "Spanish", "French", "Portuguese"]
        }
    },
    {
        id: "jaipur",
        name: "Jaipur",
        country: "India",
        description: "The Pink City.",
        tags: ["History", "Culture"],
        image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=2940&auto=format&fit=crop", // Hawa Mahal
        details: { intro: "Royal heritage...", highlights: [], languages: ["English", "Hindi"] }
    },
    {
        id: "sydney",
        name: "Sydney",
        country: "Australia",
        description: "Harbour City.",
        tags: ["Nature", "Modern"],
        image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=2940&auto=format&fit=crop",
        details: { intro: "Opera House and beaches...", highlights: [], languages: ["English"] }
    },
    {
        id: "singapore",
        name: "Singapore",
        country: "Singapore",
        description: "The Lion City.",
        tags: ["Modern", "Food", "Culture"],
        image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=2852&auto=format&fit=crop",
        details: { intro: "Garden city...", highlights: [], languages: ["English", "Mandarin"] }
    },
    {
        id: "paris",
        name: "Paris",
        country: "France",
        description: "The City of Light, brought to life through audio.",
        tags: ["History", "Culture", "Food", "Walking"],
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2946&auto=format&fit=crop",
        isPopular: true,
        details: {
            intro: "Experience Paris beyond the guidebooks. Gamana’s audio tours guide you through the winding streets of Montmartre, the grand boulevards of the Champs-Élysées, and the hidden courtyards of the Marais. Listen to stories of artists, revolutionaries, and lovers as you walk.",
            highlights: [
                "Montmartre Village Walk",
                "Eiffel Tower & Trocadéro Gardens",
                "Le Marais: History & Fashion",
                "Latin Quarter Classics"
            ],
            languages: ["English", "French", "Spanish", "German", "Mandarin"]
        }
    },
    {
        id: "rome",
        name: "Rome",
        country: "Italy",
        description: "Walk through history in the Eternal City.",
        tags: ["History", "Culture", "Food", "Walking"],
        image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=2896&auto=format&fit=crop",
        isPopular: true,
        details: {
            intro: "Rome wasn't built in a day, but you can explore its layers of history at your own pace. From the Colosseum to the Vatican, and the charming streets of Trastevere, let our audio guides reveal the secrets of the emperors and the popes.",
            highlights: [
                "Colosseum & Roman Forum",
                "Vatican City & St. Peter's Basilica",
                "Trastevere Food & Culture",
                "Pantheon & Piazza Navona"
            ],
            languages: ["English", "Italian", "French", "Spanish"]
        }
    },
    {
        id: "tokyo",
        name: "Tokyo",
        country: "Japan",
        description: "A sensory journey through neon and tradition.",
        tags: ["Culture", "Food", "History", "Walking"],
        image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2994&auto=format&fit=crop",
        isPopular: true,
        details: {
            intro: "Discover the contrast between ultra-modern skyscrapers and ancient temples in Tokyo. Our audio guides take you through the bustling crossing of Shibuya, the pop-culture haven of Akihabara, and the serene gardens of the Imperial Palace.",
            highlights: [
                "Shibuya Crossing & Hachiko",
                "Senso-ji Temple & Asakusa",
                "Harajuku Fashion Street",
                "Meiji Shrine Forest"
            ],
            languages: ["English", "Japanese", "Mandarin", "Korean"]
        }
    },
    {
        id: "london",
        name: "London",
        country: "United Kingdom",
        description: "Royal history meets modern vibes.",
        tags: ["History", "Culture", "Walking"],
        image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2940&auto=format&fit=crop",
        isPopular: true,
        details: {
            intro: "Explore London's rich tapestry of history and culture. From the royal palaces to the gritty charm of the East End, Gamana accompanies you with stories of kings, queens, dazzling playwrights, and modern innovations.",
            highlights: [
                "Tower of London & Tower Bridge",
                "Westminster & Big Ben",
                "South Bank Stroll",
                "Shoreditch Street Art"
            ],
            languages: ["English", "French", "German", "Spanish"]
        }
    },
    {
        id: "barcelona",
        name: "Barcelona",
        country: "Spain",
        description: "Gaudí’s masterpieces and Mediterranean charm.",
        tags: ["Culture", "Food", "History", "Walking"],
        image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=2832&auto=format&fit=crop",
        isNew: true,
        details: {
            intro: "Immerse yourself in the architectural wonders of Barcelona. Walk past Gaudí's Sagrada Família and Casa Batlló, explore the Gothic Quarter's medieval streets, and enjoy the vibrant atmosphere of La Rambla.",
            highlights: [
                "Sagrada Família & Gaudí Architecture",
                "Gothic Quarter Walking Tour",
                "Park Güell",
                "La Rambla & Boqueria Market"
            ],
            languages: ["English", "Spanish", "French", "Catalan"]
        }
    },
    {
        id: "kyoto",
        name: "Kyoto",
        country: "Japan",
        description: "Japan's cultural heart, whispered in audio.",
        tags: ["History", "Culture", "Nature", "Walking"],
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2832&auto=format&fit=crop",
        isNew: true,
        details: {
            intro: "Step back in time in Kyoto. Wander through thousands of vermilion torii gates at Fushimi Inari, experience the zen of rocks gardens, and spot geisha in Gion. Gamana guides you through the spiritual and traditional heart of Japan.",
            highlights: [
                "Fushimi Inari Shrine",
                "Gion District (Geisha District)",
                "Arashiyama Bamboo Grove",
                "Kinkaku-ji (Golden Pavilion)"
            ],
            languages: ["English", "Japanese", "French"]
        }
    },
    {
        id: "amsterdam",
        name: "Amsterdam",
        country: "Netherlands",
        description: "Canals, culture, and cycling stories.",
        tags: ["History", "Culture", "Walking"],
        image: "/cities/amsterdam.jpg",
        details: {
            intro: "Discover the charm of Amsterdam's canals and cobblestone streets. Learn about the Golden Age, visit the Anne Frank House neighborhood, and explore the artistic heritage of Van Gogh and Rembrandt.",
            highlights: [
                "Canal Ring Audio Tour",
                "Jordaan District Walk",
                "Museumplein & Art History",
                "Red Light District History"
            ],
            languages: ["English", "Dutch", "German", "French"]
        }
    },
    {
        id: "hyderabad",
        name: "Hyderabad",
        country: "India",
        description: "City of Pearls, Nizams, and Biryani.",
        tags: ["History", "Culture", "Food", "Walking"],
        image: "/cities/hyderabad.jpg",
        isNew: true,
        details: {
            intro: "Step into the royal past of Hyderabad. Explore the iconic Charminar, the majestic Golconda Fort, and the opulent Chowmahalla Palace. Don't forget to listen to the stories behind the world-famous Hyderabadi Biryani.",
            highlights: [
                "Charminar & Old City",
                "Golconda Fort Sound & Light",
                "Chowmahalla Palace",
                "Hussain Sagar Lake"
            ],
            languages: ["English", "Telugu", "Hindi", "Urdu"]
        }
    },
    {
        id: "chennai",
        name: "Chennai",
        country: "India",
        description: "The cultural capital of South India.",
        tags: ["Culture", "History", "Walking", "Spiritual"],
        image: "/cities/chennai.jpg",
        details: {
            intro: "Chennai is a city of deep traditions and colonial history. Visit the ancient Kapaleeshwarar Temple, walk along the expansive Marina Beach, and explore the colonial Fort St. George.",
            highlights: [
                "Kapaleeshwarar Temple",
                "Marina Beach Walk",
                "Fort St. George & Museum",
                "San Thome Basilica"
            ],
            languages: ["English", "Tamil", "Hindi"]
        }
    },
    {
        id: "mumbai",
        name: "Mumbai",
        country: "India",
        description: "The City of Dreams.",
        tags: ["Culture", "History", "Food"],
        image: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=2832&auto=format&fit=crop", // Gateway of India
        details: { intro: "Mumbai is a city of contrasts...", highlights: [], languages: ["English", "Hindi", "Marathi"] }
    },
    {
        id: "delhi",
        name: "New Delhi",
        country: "India",
        description: "Capital of India.",
        tags: ["History", "Culture", "Food"],
        image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=2832&auto=format&fit=crop", // India Gate
        details: { intro: "Explore the capital...", highlights: [], languages: ["English", "Hindi"] }
    },
    {
        id: "agra",
        name: "Agra",
        country: "India",
        description: "Home of the Taj Mahal.",
        tags: ["History", "Culture"],
        image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=2942&auto=format&fit=crop", // Taj Mahal
        details: { intro: "Symbol of love...", highlights: [], languages: ["English", "Hindi"] }
    },
    {
        id: "varanasi",
        name: "Varanasi",
        country: "India",
        description: "Spiritual capital of India.",
        tags: ["Spiritual", "Culture", "History"],
        image: "/cities/varanasi.jpg",
        details: { intro: "Ancient city...", highlights: [], languages: ["English", "Hindi"] }
    },
    {
        id: "udaipur",
        name: "Udaipur",
        country: "India",
        description: "City of Lakes.",
        tags: ["History", "Nature", "Romance"],
        image: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?q=80&w=2874&auto=format&fit=crop", // Lake Palace
        details: { intro: "Romantic lakes...", highlights: [], languages: ["English", "Hindi"] }
    },
    {
        id: "mysore",
        name: "Mysore",
        country: "India",
        description: "City of Palaces.",
        tags: ["History", "Culture"],
        image: "/cities/mysore.jpg",
        details: { intro: "Royal grandeur...", highlights: [], languages: ["English", "Kannada"] }
    },
    {
        id: "bangkok",
        name: "Bangkok",
        country: "Thailand",
        description: "Street life and shrines.",
        tags: ["Culture", "Food", "Nightlife"],
        image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=2850&auto=format&fit=crop",
        details: { intro: "Vibrant capital...", highlights: [], languages: ["English", "Thai"] }
    },
    {
        id: "dubai",
        name: "Dubai",
        country: "UAE",
        description: "Luxury and Modern Architecture.",
        tags: ["Modern", "Shopping", "Luxury"],
        image: "/cities/dubai.jpg",
        details: { intro: "Desert metropolis...", highlights: [], languages: ["English", "Arabic"] }
    },
    {
        id: "istanbul",
        name: "Istanbul",
        country: "Turkey",
        description: "Where East meets West.",
        tags: ["History", "Culture", "Food"],
        image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=2949&auto=format&fit=crop",
        details: { intro: "Historic crossroads...", highlights: [], languages: ["English", "Turkish"] }
    },
    {
        id: "athens",
        name: "Athens",
        country: "Greece",
        description: "Ancient civilization.",
        tags: ["History", "Culture"],
        image: "https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?q=80&w=2940&auto=format&fit=crop",
        details: { intro: "Cradle of democracy...", highlights: [], languages: ["English", "Greek"] }
    },
    {
        id: "berlin",
        name: "Berlin",
        country: "Germany",
        description: "History and nightlife.",
        tags: ["History", "Nightlife", "Culture"],
        image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?q=80&w=2940&auto=format&fit=crop",
        details: { intro: "Divided city reunited...", highlights: [], languages: ["English", "German"] }
    },
    {
        id: "prague",
        name: "Prague",
        country: "Czech Republic",
        description: "City of a Hundred Spires.",
        tags: ["History", "Architecture"],
        image: "https://images.unsplash.com/photo-1541849546-216549ae216d?q=80&w=2940&auto=format&fit=crop",
        details: { intro: "Fairytale city...", highlights: [], languages: ["English", "Czech"] }
    },
    {
        id: "vienna",
        name: "Vienna",
        country: "Austria",
        description: "Imperial capital.",
        tags: ["History", "Culture", "Music"],
        image: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=2944&auto=format&fit=crop",
        details: { intro: "Mozart and palaces...", highlights: [], languages: ["English", "German"] }
    },
    {
        id: "budapest",
        name: "Budapest",
        country: "Hungary",
        description: "Pearl of the Danube.",
        tags: ["History", "Relaxation"],
        image: "https://images.unsplash.com/photo-1565426873118-a17ed65d74b9?q=80&w=2940&auto=format&fit=crop",
        details: { intro: "Baths and bridges...", highlights: [], languages: ["English", "Hungarian"] }
    },
    {
        id: "lisbon",
        name: "Lisbon",
        country: "Portugal",
        description: "City of Seven Hills.",
        tags: ["History", "Walking", "Food"],
        image: "/cities/lisbon.jpg",
        details: { intro: "Trams and tiles...", highlights: [], languages: ["English", "Portuguese"] }
    },
    {
        id: "melbourne",
        name: "Melbourne",
        country: "Australia",
        description: "Cultural capital.",
        tags: ["Culture", "Food", "Art"],
        image: "/cities/melbourne.jpg",
        details: { intro: "Lanes and coffee...", highlights: [], languages: ["English"] }
    },
    {
        id: "cairo",
        name: "Cairo",
        country: "Egypt",
        description: "City of a Thousand Minarets.",
        tags: ["History", "Culture"],
        image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=2840&auto=format&fit=crop",
        details: { intro: "Pyramids and bazaars...", highlights: [], languages: ["English", "Arabic"] }
    },
    {
        id: "marrakech",
        name: "Marrakech",
        country: "Morocco",
        description: "Red City.",
        tags: ["Culture", "History"],
        image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?q=80&w=2946&auto=format&fit=crop",
        details: { intro: "Souks and palaces...", highlights: [], languages: ["English", "Arabic", "French"] }
    },
    {
        id: "capetown",
        name: "Cape Town",
        country: "South Africa",
        description: "Mother City.",
        tags: ["Nature", "History"],
        image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=2940&auto=format&fit=crop",
        details: { intro: "Mountain and sea...", highlights: [], languages: ["English"] }
    },
    {
        id: "rio",
        name: "Rio de Janeiro",
        country: "Brazil",
        description: "Marvelous City.",
        tags: ["Nature", "Culture"],
        image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=2940&auto=format&fit=crop",
        details: { intro: "Samba and beaches...", highlights: [], languages: ["English", "Portuguese"] }
    },
    {
        id: "buenosaires",
        name: "Buenos Aires",
        country: "Argentina",
        description: "Paris of South America.",
        tags: ["Culture", "Food", "Tango"],
        image: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?q=80&w=2835&auto=format&fit=crop",
        details: { intro: "Tango and steak...", highlights: [], languages: ["English", "Spanish"] }
    },
    {
        id: "machupicchu",
        name: "Cusco",
        country: "Peru",
        description: "Gateway to Machu Picchu.",
        tags: ["History", "Nature"],
        image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=2952&auto=format&fit=crop",
        details: { intro: "Inca heritage...", highlights: [], languages: ["English", "Spanish"] }
    },
    {
        id: "mexicocity",
        name: "Mexico City",
        country: "Mexico",
        description: "City of Palaces.",
        tags: ["History", "Food", "Culture"],
        image: "/cities/mexicocity.jpg",
        details: { intro: "Aztec roots...", highlights: [], languages: ["English", "Spanish"] }
    },
    {
        id: "hanoi",
        name: "Hanoi",
        country: "Vietnam",
        description: "City for Peace.",
        tags: ["History", "Culture", "Food"],
        image: "/cities/hanoi.jpg",
        details: { intro: "Ancient capital...", highlights: [], languages: ["English", "Vietnamese"] }
    },
    {
        id: "hochiminh",
        name: "Ho Chi Minh City",
        country: "Vietnam",
        description: "Pearl of the Far East.",
        tags: ["History", "Modern"],
        image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=2940&auto=format&fit=crop",
        details: { intro: "War history and skyscrapers...", highlights: [], languages: ["English", "Vietnamese"] }
    },
    {
        id: "seoul",
        name: "Seoul",
        country: "South Korea",
        description: "Soul of Asia.",
        tags: ["Modern", "Culture", "Food"],
        image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2950&auto=format&fit=crop",
        details: { intro: "K-Pop and Palaces...", highlights: [], languages: ["English", "Korean"] }
    },
    {
        id: "kualalumpur",
        name: "Kuala Lumpur",
        country: "Malaysia",
        description: "Garden City of Lights.",
        tags: ["Modern", "Food", "Culture"],
        image: "/cities/kualalumpur.jpg",
        details: { intro: "Petronas Towers...", highlights: [], languages: ["English", "Malay"] }
    },
    {
        id: "jakarta",
        name: "Jakarta",
        country: "Indonesia",
        description: "The Big Durian.",
        tags: ["Modern", "Culture"],
        image: "/cities/jakarta.jpg",
        details: { intro: "Capital of Indonesia...", highlights: [], languages: ["English", "Indonesian"] }
    },
    {
        id: "manila",
        name: "Manila",
        country: "Philippines",
        description: "Pearl of the Orient.",
        tags: ["History", "Culture"],
        image: "/cities/manila.jpg",
        details: { intro: "Intramuros...", highlights: [], languages: ["English", "Tagalog"] }
    },
    {
        id: "taipei",
        name: "Taipei",
        country: "Taiwan",
        description: "City of Azaleas.",
        tags: ["Modern", "Food", "Nature"],
        image: "https://images.unsplash.com/photo-1470004914212-05527e49370b?q=80&w=2874&auto=format&fit=crop",
        details: { intro: "Taipei 101...", highlights: [], languages: ["English", "Mandarin"] }
    },
    {
        id: "hongkong",
        name: "Hong Kong",
        country: "Hong Kong",
        description: "Asia's World City.",
        tags: ["Modern", "Food", "Shopping"],
        image: "/cities/hongkong.jpg",
        details: { intro: "Harbour views...", highlights: [], languages: ["English", "The Cantonese"] }
    },
    {
        id: "shanghai",
        name: "Shanghai",
        country: "China",
        description: "The Magic City.",
        tags: ["Modern", "History"],
        image: "/cities/shanghai.jpg",
        details: { intro: "The Bund...", highlights: [], languages: ["English", "Mandarin"] }
    },
    {
        id: "beijing",
        name: "Beijing",
        country: "China",
        description: "The Forbidden City.",
        tags: ["History", "Culture"],
        image: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=2940&auto=format&fit=crop",
        details: { intro: "Great Wall...", highlights: [], languages: ["English", "Mandarin"] }
    },
    {
        id: "osaka",
        name: "Osaka",
        country: "Japan",
        description: "The Nation's Kitchen.",
        tags: ["Food", "Modern", "Culture"],
        image: "https://images.unsplash.com/photo-1590559899731-a382839e5549?q=80&w=2832&auto=format&fit=crop",
        details: { intro: "Dotonbori...", highlights: [], languages: ["English", "Japanese"] }
    },
    {
        id: "colombo",
        name: "Colombo",
        country: "Sri Lanka",
        description: "Garden City of the East.",
        tags: ["Culture", "History"],
        image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2940&auto=format&fit=crop",
        details: { intro: "Coastal capital...", highlights: [], languages: ["English", "Sinhala"] }
    },
    {
        id: "kathmandu",
        name: "Kathmandu",
        country: "Nepal",
        description: "City of Temples.",
        tags: ["History", "Spiritual", "Nature"],
        image: "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?q=80&w=2940&auto=format&fit=crop",
        details: { intro: "Himalayan gateway...", highlights: [], languages: ["English", "Nepali"] }
    },
    {
        id: "thimphu",
        name: "Thimphu",
        country: "Bhutan",
        description: "Land of the Thunder Dragon.",
        tags: ["Culture", "Nature", "Spiritual"],
        image: "/cities/thimphu.jpg",
        details: { intro: "Happiest place...", highlights: [], languages: ["English", "Dzongkha"] }
    },
    {
        id: "male",
        name: "Malé",
        country: "Maldives",
        description: "King's Island.",
        tags: ["Nature", "Relaxation"],
        image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=2865&auto=format&fit=crop",
        details: { intro: "Island capital...", highlights: [], languages: ["English", "Dhivehi"] }
    }
];
