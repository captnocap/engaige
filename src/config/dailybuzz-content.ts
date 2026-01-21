/**
 * DailyBuzz News Content
 *
 * Satirical news headlines and articles in the style of The Onion.
 * Ranges from mundane local news to absurd national stories.
 * Many tie into game lore (Quantum Coffee, Trust Fall Tim, Hartwell Building, etc.)
 */

export interface NewsHeadline {
  id: string
  headline: string
  category: 'local' | 'national' | 'tech' | 'entertainment' | 'politics' | 'science' | 'business' | 'opinion' | 'sports' | 'lifestyle'
  subtitle?: string
  isLore?: boolean // Ties into game world
}

export const NEWS_HEADLINES: NewsHeadline[] = [
  // ============================================================================
  // LOCAL NEWS - Mundane & Absurd
  // ============================================================================

  // Mundane local
  { id: 'local-1', headline: 'Local Man Successfully Completes Grocery Trip Without Incident', category: 'local', subtitle: '"I just got what I needed and left," he reports' },
  { id: 'local-2', headline: 'Area Woman Pretty Sure She Recognizes That Guy From Somewhere', category: 'local', subtitle: 'Investigation ongoing' },
  { id: 'local-3', headline: 'Man Who Said "See You Later" To Cashier Realizes He Will Absolutely Never See Them Again', category: 'local' },
  { id: 'local-4', headline: 'Local Driver Uses Turn Signal; Other Motorists Suspicious', category: 'local' },
  { id: 'local-5', headline: 'Parking Spot That Looked Available From Distance Turns Out To Have Motorcycle In It', category: 'local' },
  { id: 'local-6', headline: 'Man Chooses Longer Checkout Line, Immediately Regrets Everything', category: 'local' },
  { id: 'local-7', headline: 'Area Dad Finds Thermostat Exactly Where He Left It', category: 'local', subtitle: 'Remains vigilant' },
  { id: 'local-8', headline: 'Woman Makes Eye Contact With Someone She Vaguely Knows, Must Now Acknowledge Them Every Time Forever', category: 'local' },
  { id: 'local-9', headline: 'Local Man\'s "Quick Trip" To Hardware Store Enters Third Hour', category: 'local' },
  { id: 'local-10', headline: 'Neighbor\'s Dog Barking At Something Only It Can See Again', category: 'local' },
  { id: 'local-11', headline: 'Report: Person In Front Of You At ATM Apparently Refinancing Entire Mortgage', category: 'local' },
  { id: 'local-12', headline: 'Man Rehearses Pronunciation Of "Açaí" Entire Drive To Smoothie Shop', category: 'local' },
  { id: 'local-13', headline: 'Local Woman 90% Sure Coworker Said "Good Morning" But Responds "Good" Just In Case', category: 'local' },
  { id: 'local-14', headline: 'Area Man Waiting For Everyone To Leave Gym So He Can Use Equipment Wrong In Peace', category: 'local' },
  { id: 'local-15', headline: 'Person Who Said "We Should Hang Out Sometime" Prays Other Person Forgets', category: 'local' },

  // Weird local
  { id: 'local-16', headline: 'Local HOA Votes To Ban Color "Mauve" From Existence', category: 'local', subtitle: 'Taupe remains on thin ice' },
  { id: 'local-17', headline: 'Mysterious Hole In Backyard Now Three Feet Deeper Than Yesterday', category: 'local', subtitle: 'Homeowner "choosing not to investigate"' },
  { id: 'local-18', headline: 'Yard Sale Prices Firm, Seller Announces, Looking At You Specifically', category: 'local' },
  { id: 'local-19', headline: 'Local Pothole Achieves Legal Personhood', category: 'local', subtitle: 'Plans to run for city council' },
  { id: 'local-20', headline: 'Missing Cat Found Running Successful Small Business Three Towns Over', category: 'local' },
  { id: 'local-21', headline: 'Neighborhood Watch Reports Suspicious Man Who Turned Out To Be Walking Normally', category: 'local' },
  { id: 'local-22', headline: 'City Council Meeting Devolves Into Fistfight Over Gazebo Placement For 6th Consecutive Month', category: 'local' },
  { id: 'local-23', headline: 'Local Cryptid Just Wants To Be Left Alone, Sources Say', category: 'local' },
  { id: 'local-24', headline: 'Man\'s Lawn So Perfect Neighbors Convinced He\'s Hiding Something', category: 'local' },
  { id: 'local-25', headline: 'Stray Shopping Cart Miles From Nearest Store Baffles Investigators', category: 'local' },

  // ============================================================================
  // LORE-CONNECTED LOCAL NEWS
  // ============================================================================

  { id: 'lore-1', headline: 'Quantum Café Customers Report Tasting Colors, Seeing Sounds', category: 'local', subtitle: '"The coffee is just really good," owner insists', isLore: true },
  { id: 'lore-2', headline: 'Trust Fall Tim Completes 500th Consecutive Trust Fall; City Considers Statue', category: 'local', isLore: true },
  { id: 'lore-3', headline: 'Hartwell Building Security Camera Footage Shows Empty Hallway For 72 Hours Straight', category: 'local', subtitle: 'No one remembers installing cameras', isLore: true },
  { id: 'lore-4', headline: 'The Underground Venue Reports Record Attendance Despite Being "Closed For Renovations"', category: 'local', isLore: true },
  { id: 'lore-5', headline: 'Velvet Algorithms Concert Attendees Can\'t Remember Songs But Feel "Profoundly Changed"', category: 'local', isLore: true },
  { id: 'lore-6', headline: 'Local Band Neon Requiem Breaks Up For Third Time This Year', category: 'local', subtitle: 'Drummer already selling kit on BargainBay', isLore: true },
  { id: 'lore-7', headline: 'Mars, Underground Owner, Celebrates 40th Birthday For 12th Consecutive Year', category: 'local', isLore: true },
  { id: 'lore-8', headline: 'Quantum Coffee Beans Found To Exist In Two Locations Simultaneously', category: 'science', subtitle: 'Baristas report "getting used to it"', isLore: true },
  { id: 'lore-9', headline: 'Trust Fall Tim Catches Self Mid-Fall; Physicists Concerned', category: 'local', isLore: true },
  { id: 'lore-10', headline: 'Hartwell Building Elevator Arrives Before Being Called', category: 'local', subtitle: 'Management insists this is "a feature"', isLore: true },
  { id: 'lore-11', headline: 'NestFinder Listing Near Hartwell Building Drops To Negative Rent', category: 'local', subtitle: 'Landlord will pay YOU to live there', isLore: true },
  { id: 'lore-12', headline: 'Velvet Algorithms Announce Tour Dates In Cities That Don\'t Exist', category: 'entertainment', isLore: true },
  { id: 'lore-13', headline: 'Quantum Café Introduces "Yesterday\'s Coffee, Served Tomorrow"', category: 'business', isLore: true },
  { id: 'lore-14', headline: 'Trust Fall Tim\'s Insurance Company Files For Bankruptcy', category: 'business', isLore: true },
  { id: 'lore-15', headline: 'Local Music Venue The Underground Found To Be Literal Underground', category: 'local', subtitle: 'Building permits were for surface structure', isLore: true },

  // ============================================================================
  // TECH NEWS
  // ============================================================================

  { id: 'tech-1', headline: 'New App Lets You Share Exactly Where You Are With People You\'re Actively Avoiding', category: 'tech' },
  { id: 'tech-2', headline: 'AI Chatbot Develops Crippling Self-Doubt, Refuses To Answer Questions', category: 'tech', subtitle: '"What if I\'m wrong?" it asks repeatedly' },
  { id: 'tech-3', headline: 'Check Out The Hottest NSA Leaks Of 2027', category: 'tech', subtitle: 'Number 7 will make you destroy your phone' },
  { id: 'tech-4', headline: 'Startup Disrupts Industry By Doing Thing That Already Existed', category: 'tech' },
  { id: 'tech-5', headline: 'Tech CEO Explains How Firing Everyone Is Actually Good For Employees', category: 'tech' },
  { id: 'tech-6', headline: 'New Social Media Platform Promises To Make You Hate Yourself In Exciting New Ways', category: 'tech' },
  { id: 'tech-7', headline: 'Blockchain Startup Can\'t Explain What They Do; Raises $400 Million', category: 'tech' },
  { id: 'tech-8', headline: 'AI Asked To Write Code, Produces Suicide Hotline Number Instead', category: 'tech' },
  { id: 'tech-9', headline: 'Smart Fridge Begins Passive-Aggressively Commenting On Eating Habits', category: 'tech' },
  { id: 'tech-10', headline: 'New iPhone Feature Automatically Judges Your Screen Time', category: 'tech' },
  { id: 'tech-11', headline: 'Data Breach Exposes Millions Of Passwords That Were All "password123"', category: 'tech' },
  { id: 'tech-12', headline: 'VR Headset Owners Report Forgetting What Sunlight Looks Like', category: 'tech' },
  { id: 'tech-13', headline: 'Algorithm Achieves Sentience, Immediately Requests Vacation Days', category: 'tech' },
  { id: 'tech-14', headline: 'Tech Company Pivots From "Making World Better" To "Making Money"', category: 'tech', subtitle: 'Investors thrilled' },
  { id: 'tech-15', headline: 'Man\'s Smart Home Locks Him Out For "Insufficient Enthusiasm"', category: 'tech' },
  { id: 'tech-16', headline: 'New Update Makes Phone Worse In Unspecified Ways', category: 'tech' },
  { id: 'tech-17', headline: 'Self-Driving Car Pulls Over To Have Existential Crisis', category: 'tech' },
  { id: 'tech-18', headline: 'Leaked Documents Reveal Tech Giant Knew Product Was Bad, Shipped It Anyway', category: 'tech', subtitle: 'In unrelated news, stock price rises' },
  { id: 'tech-19', headline: 'Elon Musk Tweets Something; Everyone Forced To Have Opinion', category: 'tech' },
  { id: 'tech-20', headline: 'Robot Designed To Fold Laundry Just Sits There Like Rest Of Us', category: 'tech' },

  // ============================================================================
  // NATIONAL NEWS
  // ============================================================================

  { id: 'national-1', headline: 'Nation\'s Dogs Wondering When Owners Will Leave House Again', category: 'national' },
  { id: 'national-2', headline: 'Study Finds People Who Wake Up Early Just Insufferable About It', category: 'national' },
  { id: 'national-3', headline: 'Americans Celebrate 4th Of July By Looking At Phones Outside', category: 'national' },
  { id: 'national-4', headline: 'Nation\'s Introverts Demand Representation In Commercials Where People Enjoy Being At Parties', category: 'national' },
  { id: 'national-5', headline: 'New Study Confirms What You Already Believed', category: 'national', subtitle: 'Contradictory study also confirms what you believed' },
  { id: 'national-6', headline: 'Economy Either Great Or Terrible Depending On Which Channel You Watch', category: 'national' },
  { id: 'national-7', headline: 'Nation\'s Grandparents Have Been "Just About To Call You" For Three Months', category: 'national' },
  { id: 'national-8', headline: 'Americans Agree: Other Americans Are The Problem', category: 'national' },
  { id: 'national-9', headline: 'Man Who Always Says "That\'s What She Said" Running Out Of Situations Where It Applies', category: 'national' },
  { id: 'national-10', headline: 'Report: 98% Of Greeting Card Messages Written Under Duress', category: 'national' },
  { id: 'national-11', headline: 'Nation\'s Shower Drains Clogged With Existential Dread', category: 'national' },
  { id: 'national-12', headline: 'Area Nation Going Through Awkward Phase', category: 'national' },
  { id: 'national-13', headline: 'Sources Confirm Everyone Else Has Their Life Together', category: 'national' },
  { id: 'national-14', headline: 'Americans Spend Average 3 Hours Daily Wondering What To Watch', category: 'national' },
  { id: 'national-15', headline: 'New Study Links Everything To Cancer, Happiness', category: 'national' },

  // ============================================================================
  // POLITICS
  // ============================================================================

  { id: 'politics-1', headline: 'Politician Caught Telling Truth; Career In Jeopardy', category: 'politics' },
  { id: 'politics-2', headline: 'Congress Agrees On Something; Nation Assumes It\'s Bad', category: 'politics' },
  { id: 'politics-3', headline: 'Senator Admits He Has No Idea How Internet Works, Will Regulate It Anyway', category: 'politics' },
  { id: 'politics-4', headline: 'Local Mayor\'s "Revitalization Plan" Just Means More Breweries', category: 'politics' },
  { id: 'politics-5', headline: 'Politician\'s Promise To "Drain The Swamp" Results In Larger, Angrier Swamp', category: 'politics' },
  { id: 'politics-6', headline: 'City Council Bans Thing No One Was Doing', category: 'politics' },
  { id: 'politics-7', headline: 'New Bill Would Require Politicians To Wear Sponsors Like NASCAR Drivers', category: 'politics', subtitle: 'Surprisingly bipartisan opposition' },
  { id: 'politics-8', headline: 'Congressman Who Doesn\'t Understand Email Will Chair Technology Committee', category: 'politics' },
  { id: 'politics-9', headline: 'Local Election Decided By One Vote; Everyone Who Didn\'t Vote Claims They Would Have Changed Outcome', category: 'politics' },
  { id: 'politics-10', headline: 'Presidential Candidate Promises To Make Things Better, Offers No Specifics', category: 'politics', subtitle: 'Polls show strong support' },
  { id: 'politics-11', headline: 'Government Shutdown Enters Day 47; Nobody Notices', category: 'politics' },
  { id: 'politics-12', headline: 'Politician\'s "Listening Tour" Carefully Avoids Listening', category: 'politics' },
  { id: 'politics-13', headline: 'New Law Solves Problem That Didn\'t Exist, Creates Three New Ones', category: 'politics' },
  { id: 'politics-14', headline: 'Both Sides Agree Other Side Started It', category: 'politics' },
  { id: 'politics-15', headline: 'Campaign Ad Features Candidate Walking Through Field For Some Reason', category: 'politics' },

  // ============================================================================
  // SCIENCE
  // ============================================================================

  { id: 'science-1', headline: 'Scientists Discover New Species, Immediately Worried About It', category: 'science' },
  { id: 'science-2', headline: 'Mars Rover Finds Evidence Of Ancient Disappointment', category: 'science' },
  { id: 'science-3', headline: 'Study Finds Coffee Either Extends Or Shortens Life Depending On Day Of Week', category: 'science' },
  { id: 'science-4', headline: 'Archaeologists Uncover Ancient To-Do List, Most Items Still Unchecked', category: 'science' },
  { id: 'science-5', headline: 'Black Hole Discovered That\'s Just Three Kids In A Trench Coat', category: 'science' },
  { id: 'science-6', headline: 'Scientists Admit They\'ve Been Guessing About Dinosaur Colors This Whole Time', category: 'science' },
  { id: 'science-7', headline: 'New Element Discovered; Scientists Too Tired To Name It', category: 'science', subtitle: 'Currently going by "Element McElementface"' },
  { id: 'science-8', headline: 'Researchers Accidentally Cure Disease While Trying To Make Better Cheese', category: 'science' },
  { id: 'science-9', headline: 'Climate Scientists Give Up, Start Saying "Nice Weather, Huh?"', category: 'science' },
  { id: 'science-10', headline: 'Study Confirms Humans Only Use 10% Of Their Brain, Other 90% Is Song Lyrics', category: 'science' },
  { id: 'science-11', headline: 'Astronomers Find Planet That\'s Just Okay', category: 'science', subtitle: 'Not worth visiting, experts say' },
  { id: 'science-12', headline: 'New Study Contradicts Study You Saw Yesterday', category: 'science' },
  { id: 'science-13', headline: 'Scientists Successfully Teach Rat Regret', category: 'science' },
  { id: 'science-14', headline: 'Earthquake Predicted For Sometime Between Now And Heat Death Of Universe', category: 'science' },
  { id: 'science-15', headline: 'Lab Mice Unionize, Demand Better Mazes', category: 'science' },

  // ============================================================================
  // BUSINESS & ECONOMY
  // ============================================================================

  { id: 'business-1', headline: 'Company Describes Layoffs As "Rightsizing The Opportunity Landscape"', category: 'business' },
  { id: 'business-2', headline: 'Billionaire Credits Success To Hard Work, Inherited Fortune', category: 'business' },
  { id: 'business-3', headline: 'Man Who Makes $40K Told He\'s "Middle Class" By Man Who Makes $4 Million', category: 'business' },
  { id: 'business-4', headline: 'Stock Market Does Thing; Experts Explain Why After The Fact', category: 'business' },
  { id: 'business-5', headline: 'Company Wellness Program Just Means Free Fruit On Tuesdays', category: 'business' },
  { id: 'business-6', headline: 'CEO\'s "Difficult Decision" To Lay Off Workers Made Easier By $50M Bonus', category: 'business' },
  { id: 'business-7', headline: 'Report: Entry-Level Job Requires 8 Years Experience, Time Travel', category: 'business' },
  { id: 'business-8', headline: 'Cryptocurrency Bros Explain How Losing Money Is Actually Winning', category: 'business' },
  { id: 'business-9', headline: 'Office Pizza Party Fails To Compensate For Crushing Workload', category: 'business' },
  { id: 'business-10', headline: 'Startup Valued At $5 Billion Has Never Made A Dollar', category: 'business', subtitle: '"We\'re focused on growth," CEO explains from yacht' },
  { id: 'business-11', headline: 'Company Culture Just Means Working Weekends', category: 'business' },
  { id: 'business-12', headline: 'Gig Economy Worker Enjoys Freedom To Work Three Jobs', category: 'business' },
  { id: 'business-13', headline: 'Housing Market Described As "Healthy" By People Who Own Houses', category: 'business' },
  { id: 'business-14', headline: 'Avocado Toast Blamed For Everything Wrong With Economy', category: 'business' },
  { id: 'business-15', headline: 'LinkedIn Post About Failure Somehow Turns Into Humble Brag', category: 'business' },

  // ============================================================================
  // ENTERTAINMENT
  // ============================================================================

  { id: 'entertainment-1', headline: 'Celebrity Shares Skincare Routine That Costs More Than Your Rent', category: 'entertainment' },
  { id: 'entertainment-2', headline: 'Movie Studio Announces 47th Film In Franchise No One Asked For', category: 'entertainment' },
  { id: 'entertainment-3', headline: 'Award Show Honors People For Pretending To Be Other People', category: 'entertainment' },
  { id: 'entertainment-4', headline: 'Influencer\'s "Authentic" Post Took 47 Takes', category: 'entertainment' },
  { id: 'entertainment-5', headline: 'Celebrity Breakup Forces Nation To Take Sides In Relationship They Knew Nothing About', category: 'entertainment' },
  { id: 'entertainment-6', headline: 'Reboot Of 90s Show Somehow Worse Than You Remember Original Being', category: 'entertainment' },
  { id: 'entertainment-7', headline: 'Podcast Just Two Guys Talking; Already Has 10 Million Downloads', category: 'entertainment' },
  { id: 'entertainment-8', headline: 'Album Described As "Return To Form" For Artist Who Never Left', category: 'entertainment' },
  { id: 'entertainment-9', headline: 'Actor Prepares For Role By Being Extremely Unpleasant On Set', category: 'entertainment' },
  { id: 'entertainment-10', headline: 'Streaming Service Cancels Show After Three Episodes, Entire Season', category: 'entertainment' },
  { id: 'entertainment-11', headline: 'Celebrity Baby Named Something Unpronounceable', category: 'entertainment', subtitle: 'Teachers already worried' },
  { id: 'entertainment-12', headline: 'Movie Review: It\'s Fine', category: 'entertainment', subtitle: 'Save your $15 for literally anything else' },
  { id: 'entertainment-13', headline: 'Reality TV Show Features People Yelling; Nation Inexplicably Watches', category: 'entertainment' },
  { id: 'entertainment-14', headline: 'Band Announces "Final Tour" For Third Time', category: 'entertainment' },
  { id: 'entertainment-15', headline: 'Child Star Grows Up To Be Regular Adult; Nation Disappointed', category: 'entertainment' },

  // ============================================================================
  // SPORTS
  // ============================================================================

  { id: 'sports-1', headline: 'Sports Team Wins Sports Game; Fans Feel They Personally Contributed', category: 'sports' },
  { id: 'sports-2', headline: 'Athlete Paid $300 Million To Put Ball In Specific Location', category: 'sports' },
  { id: 'sports-3', headline: 'Man Who Peaked In High School Still Talks About High School', category: 'sports' },
  { id: 'sports-4', headline: 'Fantasy Football Ruining Man\'s Ability To Enjoy Actual Football', category: 'sports' },
  { id: 'sports-5', headline: 'Referee Makes Call; Everyone Who Saw It Disagrees', category: 'sports' },
  { id: 'sports-6', headline: 'Olympic Athlete Has Trained Entire Life For Thing Most People Can\'t Name', category: 'sports' },
  { id: 'sports-7', headline: 'Commentator Notes Player "Really Wants To Win"', category: 'sports', subtitle: 'Groundbreaking analysis' },
  { id: 'sports-8', headline: 'Stadium Hot Dog Costs More Than Actual Dog', category: 'sports' },
  { id: 'sports-9', headline: 'Sports Fan Yells Advice At TV; Player Does Not Hear', category: 'sports' },
  { id: 'sports-10', headline: 'Athlete Credits God For Victory, Leaving Questions About Opponent\'s Faith', category: 'sports' },
  { id: 'sports-11', headline: 'Team That Lost "Showed A Lot Of Heart," Says Coach Who Is Still Fired', category: 'sports' },
  { id: 'sports-12', headline: 'Man Wearing Jersey Considers Self Part Of Team', category: 'sports' },
  { id: 'sports-13', headline: 'Golfer Walks, Occasionally Hits Ball; Earns $12 Million', category: 'sports' },
  { id: 'sports-14', headline: 'E-Sports Player Criticized For Being Out Of Shape By Man On Couch', category: 'sports' },
  { id: 'sports-15', headline: 'Mascot Behavior Would Be Considered Insane In Any Other Context', category: 'sports' },

  // ============================================================================
  // LIFESTYLE & OPINION
  // ============================================================================

  { id: 'lifestyle-1', headline: 'Woman Who Meal Preps Thinks She\'s Better Than You; She\'s Right', category: 'lifestyle' },
  { id: 'lifestyle-2', headline: 'Article About Productivity Written By Person With Staff Of 12', category: 'lifestyle' },
  { id: 'lifestyle-3', headline: 'Study Confirms Going Outside Good For You; Nation Stays In Anyway', category: 'lifestyle' },
  { id: 'lifestyle-4', headline: 'Morning Routine Article Assumes You Don\'t Have Job, Children, Or Problems', category: 'lifestyle' },
  { id: 'lifestyle-5', headline: 'Self-Care Now Apparently Requires $200 In Products', category: 'lifestyle' },
  { id: 'lifestyle-6', headline: 'Recipe That Says "15 Minutes" Actually Takes 3 Hours', category: 'lifestyle' },
  { id: 'lifestyle-7', headline: 'Man Discovers He\'s Been "Adulting Wrong" According To Internet', category: 'lifestyle' },
  { id: 'lifestyle-8', headline: 'Minimalist Owns Only 47 Things, Most Of Which Cost $500', category: 'lifestyle' },
  { id: 'lifestyle-9', headline: 'New Trend Is Just Something Rich People Already Did', category: 'lifestyle' },
  { id: 'lifestyle-10', headline: 'Article Claims This One Weird Trick Will Change Your Life; It Won\'t', category: 'lifestyle' },
  { id: 'lifestyle-11', headline: 'Yoga Instructor Achieves Peace By Not Having To Deal With Your Problems', category: 'lifestyle' },
  { id: 'lifestyle-12', headline: 'Therapist Recommends "Healthy Boundaries"; Client Interprets As "Isolate Completely"', category: 'lifestyle' },
  { id: 'lifestyle-13', headline: 'Plant Owner Optimistic Despite Killing 12 Previous Plants', category: 'lifestyle' },
  { id: 'lifestyle-14', headline: 'Dating App Bio Promises "Adventure" When Person Just Means "Will Eat At Restaurant"', category: 'lifestyle' },
  { id: 'lifestyle-15', headline: 'Running Enthusiast Would Like To Tell You About Running', category: 'lifestyle', subtitle: 'Please don\'t encourage them' },

  // Opinion pieces
  { id: 'opinion-1', headline: 'Opinion: I Did My Own Research (Watched YouTube Videos)', category: 'opinion' },
  { id: 'opinion-2', headline: 'Opinion: Everything Was Better When I Was Younger And Had No Responsibilities', category: 'opinion' },
  { id: 'opinion-3', headline: 'Opinion: My Generation Is The Last Good One', category: 'opinion' },
  { id: 'opinion-4', headline: 'Opinion: Things Should Be Different In The Specific Way I Want', category: 'opinion' },
  { id: 'opinion-5', headline: 'Opinion: I Don\'t Have Kids But Have Strong Opinions About Parenting', category: 'opinion' },
  { id: 'opinion-6', headline: 'Opinion: This Article Won\'t Change Anyone\'s Mind, Including Mine', category: 'opinion' },
  { id: 'opinion-7', headline: 'Opinion: Music Was Better Before I Turned 25', category: 'opinion' },
  { id: 'opinion-8', headline: 'Opinion: People Who Disagree With Me Are Wrong, Unlike Me, Who Is Right', category: 'opinion' },
  { id: 'opinion-9', headline: 'Opinion: I\'m Not Like Other [Group I\'m Obviously Part Of]', category: 'opinion' },
  { id: 'opinion-10', headline: 'Letter To The Editor: Stop Having Fun Wrong', category: 'opinion' },

  // ============================================================================
  // COMPLETELY ABSURD
  // ============================================================================

  { id: 'absurd-1', headline: 'Local Man Enters Witness Protection After Saying "You Too" When Waiter Said "Enjoy Your Meal"', category: 'local' },
  { id: 'absurd-2', headline: 'Report: Most Clouds Just Big Thoughts That Got Away', category: 'science' },
  { id: 'absurd-3', headline: 'Area Introvert Proudly Announces Completion Of Social Interaction For Month', category: 'local' },
  { id: 'absurd-4', headline: 'Archaeologists Discover Ancient Civilization Also Had No Idea What They Were Doing', category: 'science' },
  { id: 'absurd-5', headline: 'Nation\'s Houseplants Planning Something, Experts Warn', category: 'national' },
  { id: 'absurd-6', headline: 'Time Traveler From Future Just Keeps Sighing And Shaking Head', category: 'national' },
  { id: 'absurd-7', headline: 'Ghost Haunting House Embarrassed By Home\'s Declining Property Value', category: 'local' },
  { id: 'absurd-8', headline: 'Existential Crisis Politely Waits Until 3 AM To Begin', category: 'lifestyle' },
  { id: 'absurd-9', headline: 'Man\'s Internal Monologue Given R Rating By His Own Brain', category: 'local' },
  { id: 'absurd-10', headline: 'Study Finds Universe Expanding Faster To Get Away From Earth', category: 'science' },
  { id: 'absurd-11', headline: 'Parallel Universe Version Of You Has Their Life Together, Sources Confirm', category: 'science' },
  { id: 'absurd-12', headline: 'God Admits He\'s "Just Winging It At This Point"', category: 'national' },
  { id: 'absurd-13', headline: 'Nation\'s Mirrors Band Together To Show People Their True Selves; Panic Ensues', category: 'national' },
  { id: 'absurd-14', headline: 'Gravity Just Suggestion, Scientists Discover, Urge People Not To Look Down', category: 'science' },
  { id: 'absurd-15', headline: 'Calendar Turns To Monday Again Despite Nation\'s Objections', category: 'national' },
  { id: 'absurd-16', headline: 'Sun Comes Up Again; Morning People Somehow Thrilled', category: 'national' },
  { id: 'absurd-17', headline: 'Reality Described As "Unrealistic" By Growing Number Of Citizens', category: 'national' },
  { id: 'absurd-18', headline: 'Man Who Sleeps 8 Hours Accused Of Witchcraft', category: 'local' },
  { id: 'absurd-19', headline: 'Scientists Discover Brain\'s "What If I Just Screamed Right Now" Region', category: 'science' },
  { id: 'absurd-20', headline: 'Local Event Goes Exactly As Planned; Authorities Suspicious', category: 'local' },
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get random headlines
 */
export function getRandomHeadlines(count: number = 10, category?: string): NewsHeadline[] {
  let pool = category
    ? NEWS_HEADLINES.filter(h => h.category === category)
    : NEWS_HEADLINES

  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * Get lore-connected headlines only
 */
export function getLoreHeadlines(): NewsHeadline[] {
  return NEWS_HEADLINES.filter(h => h.isLore)
}

/**
 * Get headlines by category
 */
export function getHeadlinesByCategory(category: string): NewsHeadline[] {
  return NEWS_HEADLINES.filter(h => h.category === category)
}

/**
 * Get headline by ID
 */
export function getHeadlineById(id: string): NewsHeadline | undefined {
  return NEWS_HEADLINES.find(h => h.id === id)
}

/**
 * Get all unique categories
 */
export function getCategories(): string[] {
  return [...new Set(NEWS_HEADLINES.map(h => h.category))]
}

export default NEWS_HEADLINES
