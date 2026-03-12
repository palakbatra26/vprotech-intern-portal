import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB Connection
const mongoUrl = process.env.MONGODB_URL || 'mongodb+srv://palakbatra79_vprohiring:vprohiring@cluster0.7il53yg.mongodb.net/';
const dbName = process.env.DB_NAME || 'vprohiring';

// Question Schema
const questionSchema = new mongoose.Schema({
  categoryType: { type: String, enum: ['aptitude', 'technical'], required: true },
  domain: { type: String, required: true },
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  marks: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

const Question = mongoose.model('Question', questionSchema);

// Cutoff Schema
const cutoffSchema = new mongoose.Schema({
  domain: { type: String, required: true, unique: true },
  aptitudeCutoff: { type: Number, default: 4 },
  technicalCutoff: { type: Number, default: 10 },
  overallCutoff: { type: Number, default: 14 },
  violationThreshold: { type: Number, default: 3 },
  approvalWaitMinutes: { type: Number, default: 5 },
  updatedAt: { type: Date, default: Date.now }
});

const Cutoff = mongoose.model('Cutoff', cutoffSchema);

// Sample Aptitude Questions
const aptitudeQuestions = [
  {
    categoryType: 'aptitude',
    domain: 'General',
    questionText: 'What is the next number in the sequence: 2, 6, 12, 20, 30, ?',
    options: ['40', '42', '44', '46'],
    correctAnswer: '42',
    difficulty: 'medium'
  },
  {
    categoryType: 'aptitude',
    domain: 'General',
    questionText: 'If a train travels 360 km in 4 hours, what is its speed in m/s?',
    options: ['25 m/s', '30 m/s', '20 m/s', '15 m/s'],
    correctAnswer: '25 m/s',
    difficulty: 'easy'
  },
  {
    categoryType: 'aptitude',
    domain: 'General',
    questionText: 'What is the average of first 10 natural numbers?',
    options: ['5', '5.5', '6', '6.5'],
    correctAnswer: '5.5',
    difficulty: 'easy'
  },
  {
    categoryType: 'aptitude',
    domain: 'General',
    questionText: 'A man buys an article for Rs. 100 and sells it for Rs. 120. What is his profit percentage?',
    options: ['15%', '20%', '25%', '10%'],
    correctAnswer: '20%',
    difficulty: 'easy'
  },
  {
    categoryType: 'aptitude',
    domain: 'General',
    questionText: 'What comes next: A, C, F, J, ?',
    options: ['M', 'N', 'O', 'P'],
    correctAnswer: 'O',
    difficulty: 'medium'
  },
  {
    categoryType: 'aptitude',
    domain: 'General',
    questionText: 'If CLOCK is coded as DMPDL, how will WATCH be coded?',
    options: ['XBUDI', 'XBUDG', 'XBUCH', 'YBVCH'],
    correctAnswer: 'XBUDI',
    difficulty: 'medium'
  },
  {
    categoryType: 'aptitude',
    domain: 'General',
    questionText: 'Find the missing number: 8, 27, 64, 125, ?',
    options: ['196', '216', '225', '256'],
    correctAnswer: '216',
    difficulty: 'easy'
  },
  {
    categoryType: 'aptitude',
    domain: 'General',
    questionText: 'A person goes 10 km north, then 10 km east, then 10 km south. How far is he from the starting point?',
    options: ['10 km', '20 km', '30 km', '15 km'],
    correctAnswer: '10 km',
    difficulty: 'medium'
  },
  {
    categoryType: 'aptitude',
    domain: 'General',
    questionText: 'In a certain code, SISTER is written as RHRSDQ. How is BROTHER written in that code?',
    options: ['AQNSGDQ', 'CQNUGSQ', 'CQQNSF', 'AQNSGDQ'],
    correctAnswer: 'AQNSGDQ',
    difficulty: 'hard'
  },
  {
    categoryType: 'aptitude',
    domain: 'General',
    questionText: 'The ratio of ages of A and B is 3:4. After 5 years, the ratio will be 4:5. Find their present ages.',
    options: ['15 and 20', '12 and 16', '18 and 24', '20 and 25'],
    correctAnswer: '15 and 20',
    difficulty: 'hard'
  }
];

// Full Stack Developer Questions
const fullStackQuestions = [
  {
    categoryType: 'technical',
    domain: 'Full Stack Developer',
    questionText: 'Which HTML tag is used to define an internal style sheet?',
    options: ['<css>', '<script>', '<style>', '<link>'],
    correctAnswer: '<style>',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Full Stack Developer',
    questionText: 'What does CSS stand for?',
    options: ['Computer Style Sheets', 'Creative Style Sheets', 'Cascading Style Sheets', 'Colorful Style Sheets'],
    correctAnswer: 'Cascading Style Sheets',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Full Stack Developer',
    questionText: 'Which JavaScript method is used to select an element by its ID?',
    options: ['querySelector()', 'getElementById()', 'getElementsByClass()', 'getElement()'],
    correctAnswer: 'getElementById()',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Full Stack Developer',
    questionText: 'What is the correct way to create a React component?',
    options: ['function MyComponent() {}', 'class MyComponent() {}', 'React.component()', 'new Component()'],
    correctAnswer: 'function MyComponent() {}',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Full Stack Developer',
    questionText: 'Which hook is used to perform side effects in React?',
    options: ['useState', 'useEffect', 'useContext', 'useReducer'],
    correctAnswer: 'useEffect',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Full Stack Developer',
    questionText: 'What is Node.js built on?',
    options: ['Java', 'Chrome V8 Engine', 'Python', 'Ruby'],
    correctAnswer: 'Chrome V8 Engine',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Full Stack Developer',
    questionText: 'Which HTTP method is used to update an existing resource?',
    options: ['GET', 'POST', 'PUT', 'DELETE'],
    correctAnswer: 'PUT',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Full Stack Developer',
    questionText: 'What does SQL stand for?',
    options: ['Structured Query Language', 'Simple Query Language', 'System Question Language', 'Standard Query Logic'],
    correctAnswer: 'Structured Query Language',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Full Stack Developer',
    questionText: 'Which is NOT a JavaScript framework?',
    options: ['React', 'Angular', 'Django', 'Vue'],
    correctAnswer: 'Django',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Full Stack Developer',
    questionText: 'What is the purpose of useState hook in React?',
    options: ['To manage side effects', 'To manage state', 'To access context', 'To reduce component size'],
    correctAnswer: 'To manage state',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Full Stack Developer',
    questionText: 'Which command is used to initialize a new Node.js project?',
    options: ['node init', 'npm start', 'npm init', 'node start'],
    correctAnswer: 'npm init',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Full Stack Developer',
    questionText: 'What is the virtual DOM in React?',
    options: ['A direct copy of HTML DOM', 'A lightweight JavaScript representation of DOM', 'A browser API', 'A CSS framework'],
    correctAnswer: 'A lightweight JavaScript representation of DOM',
    difficulty: 'medium'
  },
  {
    categoryType: 'technical',
    domain: 'Full Stack Developer',
    questionText: 'Which CSS property is used to create flexbox layout?',
    options: ['display: block', 'display: flex', 'display: grid', 'display: inline'],
    correctAnswer: 'display: flex',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Full Stack Developer',
    questionText: 'What is the purpose of async/await in JavaScript?',
    options: ['To make code run faster', 'To handle asynchronous operations', 'To create loops', 'To define classes'],
    correctAnswer: 'To handle asynchronous operations',
    difficulty: 'medium'
  },
  {
    categoryType: 'technical',
    domain: 'Full Stack Developer',
    questionText: 'Which is NOT a JavaScript data type?',
    options: ['undefined', 'boolean', 'float', 'object'],
    correctAnswer: 'float',
    difficulty: 'medium'
  },
  {
    categoryType: 'technical',
    domain: 'Full Stack Developer',
    questionText: 'What is the default port for MongoDB?',
    options: ['3306', '27017', '5432', '8080'],
    correctAnswer: '27017',
    difficulty: 'medium'
  },
  {
    categoryType: 'technical',
    domain: 'Full Stack Developer',
    questionText: 'Which lifecycle method is called after a component is mounted in React?',
    options: ['componentWillMount', 'componentDidMount', 'componentWillUpdate', 'componentDidUpdate'],
    correctAnswer: 'componentDidMount',
    difficulty: 'medium'
  },
  {
    categoryType: 'technical',
    domain: 'Full Stack Developer',
    questionText: 'What is the purpose of props in React?',
    options: ['To store local state', 'To pass data between components', 'To perform calculations', 'To make API calls'],
    correctAnswer: 'To pass data between components',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Full Stack Developer',
    questionText: 'Which HTTP status code indicates a successful response?',
    options: ['404', '500', '200', '301'],
    correctAnswer: '200',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Full Stack Developer',
    questionText: 'What is the correct syntax for a JavaScript arrow function?',
    options: ['function => ()', '() => {}', '=> function()', 'function() =>'],
    correctAnswer: '() => {}',
    difficulty: 'easy'
  }
];

// Networking Security / Cybersecurity Questions
const cybersecurityQuestions = [
  {
    categoryType: 'technical',
    domain: 'Networking Security / Cybersecurity',
    questionText: 'What does VPN stand for?',
    options: ['Virtual Private Network', 'Visual Private Network', 'Virtual Public Network', 'Verified Private Network'],
    correctAnswer: 'Virtual Private Network',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Networking Security / Cybersecurity',
    questionText: 'Which protocol is used for secure web browsing?',
    options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'],
    correctAnswer: 'HTTPS',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Networking Security / Cybersecurity',
    questionText: 'What is a firewall?',
    options: ['A type of virus', 'A network security system', 'A programming language', 'A database'],
    correctAnswer: 'A network security system',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Networking Security / Cybersecurity',
    questionText: 'What does DDoS stand for?',
    options: ['Direct Denial of Service', 'Distributed Denial of Service', 'Dynamic Denial of Service', 'Data Denial of Service'],
    correctAnswer: 'Distributed Denial of Service',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Networking Security / Cybersecurity',
    questionText: 'What is phishing?',
    options: ['A type of fishing sport', 'A cyber attack to steal information', 'A network protocol', 'A programming language'],
    correctAnswer: 'A cyber attack to steal information',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Networking Security / Cybersecurity',
    questionText: 'Which layer of the OSI model handles encryption?',
    options: ['Physical Layer', 'Data Link Layer', 'Presentation Layer', 'Network Layer'],
    correctAnswer: 'Presentation Layer',
    difficulty: 'medium'
  },
  {
    categoryType: 'technical',
    domain: 'Networking Security / Cybersecurity',
    questionText: 'What is the purpose of SSL/TLS?',
    options: ['To speed up websites', 'To provide secure communication', 'To store data', 'To manage networks'],
    correctAnswer: 'To provide secure communication',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Networking Security / Cybersecurity',
    questionText: 'What is a malware?',
    options: ['A type of hardware', 'Malicious software', 'A network protocol', 'A programming language'],
    correctAnswer: 'Malicious software',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Networking Security / Cybersecurity',
    questionText: 'Which port does HTTPS use by default?',
    options: ['80', '443', '21', '25'],
    correctAnswer: '443',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Networking Security / Cybersecurity',
    questionText: 'What is two-factor authentication?',
    options: ['Using two passwords', 'Using two different methods to verify identity', 'Logging in twice', 'Having two accounts'],
    correctAnswer: 'Using two different methods to verify identity',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Networking Security / Cybersecurity',
    questionText: 'What is SQL injection?',
    options: ['A type of database', 'An attack to manipulate database queries', 'A programming language', 'A network protocol'],
    correctAnswer: 'An attack to manipulate database queries',
    difficulty: 'medium'
  },
  {
    categoryType: 'technical',
    domain: 'Networking Security / Cybersecurity',
    questionText: 'What does IP stand for?',
    options: ['Internet Protocol', 'Internal Protocol', 'Information Protocol', 'Interconnected Protocol'],
    correctAnswer: 'Internet Protocol',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Networking Security / Cybersecurity',
    questionText: 'What is a proxy server used for?',
    options: ['To store files', 'To act as intermediary for requests', 'To create websites', 'To secure passwords'],
    correctAnswer: 'To act as intermediary for requests',
    difficulty: 'medium'
  },
  {
    categoryType: 'technical',
    domain: 'Networking Security / Cybersecurity',
    questionText: 'Which type of attack floods a network with traffic?',
    options: ['Phishing', 'Man-in-the-middle', 'DDoS', 'SQL Injection'],
    correctAnswer: 'DDoS',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Networking Security / Cybersecurity',
    questionText: 'What is the primary function of antivirus software?',
    options: ['To speed up computers', 'To detect and remove malware', 'To manage networks', 'To create backups'],
    correctAnswer: 'To detect and remove malware',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Networking Security / Cybersecurity',
    questionText: 'What is a vulnerability in cybersecurity?',
    options: ['A strength in the system', 'A weakness that can be exploited', 'A type of firewall', 'A programming error'],
    correctAnswer: 'A weakness that can be exploited',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Networking Security / Cybersecurity',
    questionText: 'What does TLS stand for?',
    options: ['Transport Layer Security', 'Transfer Level Security', 'Technical Layer Security', 'Trusted Link Security'],
    correctAnswer: 'Transport Layer Security',
    difficulty: 'medium'
  },
  {
    categoryType: 'technical',
    domain: 'Networking Security / Cybersecurity',
    questionText: 'What is social engineering in cybersecurity?',
    options: ['A programming technique', 'Manipulating people to reveal confidential information', 'A network protocol', 'A type of encryption'],
    correctAnswer: 'Manipulating people to reveal confidential information',
    difficulty: 'medium'
  },
  {
    categoryType: 'technical',
    domain: 'Networking Security / Cybersecurity',
    questionText: 'Which protocol is used for secure file transfer?',
    options: ['FTP', 'HTTP', 'SFTP', 'TELNET'],
    correctAnswer: 'SFTP',
    difficulty: 'medium'
  },
  {
    categoryType: 'technical',
    domain: 'Networking Security / Cybersecurity',
    questionText: 'What is a zero-day vulnerability?',
    options: ['A vulnerability that exists for zero days', 'A vulnerability unknown to the vendor with no patch', 'A type of firewall', 'A programming error'],
    correctAnswer: 'A vulnerability unknown to the vendor with no patch',
    difficulty: 'hard'
  }
];

// Graphic Design Questions
const graphicDesignQuestions = [
  {
    categoryType: 'technical',
    domain: 'Graphic Design',
    questionText: 'What does RGB stand for?',
    options: ['Red Green Blue', 'Red Gray Brown', 'Royal Green Blue', 'Red Green Brown'],
    correctAnswer: 'Red Green Blue',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Graphic Design',
    questionText: 'Which file format supports transparency?',
    options: ['JPEG', 'PNG', 'BMP', 'TIFF'],
    correctAnswer: 'PNG',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Graphic Design',
    questionText: 'What is the CMYK color model used for?',
    options: ['Web design', 'Print design', 'Video editing', '3D modeling'],
    correctAnswer: 'Print design',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Graphic Design',
    questionText: 'Which tool is used to select colors in Adobe Photoshop?',
    options: ['Type Tool', 'Color Picker', 'Pen Tool', 'Move Tool'],
    correctAnswer: 'Color Picker',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Graphic Design',
    questionText: 'What is a vector graphic?',
    options: ['A pixel-based image', 'An image made of mathematical equations', 'A photograph', 'A scanned document'],
    correctAnswer: 'An image made of mathematical equations',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Graphic Design',
    questionText: 'Which resolution is suitable for print design?',
    options: ['72 DPI', '150 DPI', '300 DPI', '72 PPI'],
    correctAnswer: '300 DPI',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Graphic Design',
    questionText: 'What does UI stand for?',
    options: ['User Interface', 'Universal Interface', 'User Integration', 'Unified Interface'],
    correctAnswer: 'User Interface',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Graphic Design',
    questionText: 'Which software is primarily used for vector graphics?',
    options: ['Adobe Photoshop', 'Adobe Illustrator', 'CorelDRAW', 'Both B and C'],
    correctAnswer: 'Both B and C',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Graphic Design',
    questionText: 'What is the golden ratio approximately equal to?',
    options: ['1.414', '1.618', '2.718', '3.14'],
    correctAnswer: '1.618',
    difficulty: 'medium'
  },
  {
    categoryType: 'technical',
    domain: 'Graphic Design',
    questionText: 'What is kerning in typography?',
    options: ['The weight of fonts', 'The space between letters', 'The size of text', 'The style of font'],
    correctAnswer: 'The space between letters',
    difficulty: 'medium'
  },
  {
    categoryType: 'technical',
    domain: 'Graphic Design',
    questionText: 'Which color scheme uses colors opposite each other on the color wheel?',
    options: ['Analogous', 'Complementary', 'Triadic', 'Monochromatic'],
    correctAnswer: 'Complementary',
    difficulty: 'medium'
  },
  {
    categoryType: 'technical',
    domain: 'Graphic Design',
    questionText: 'What is a mockup in design?',
    options: ['A rough sketch', 'A visual representation of a design', 'A final print', 'A type of font'],
    correctAnswer: 'A visual representation of a design',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Graphic Design',
    questionText: 'What does SVG stand for?',
    options: ['Scalable Vector Graphics', 'Static Vector Graphics', 'Simple Vector Graphics', 'Standard Vector Graphics'],
    correctAnswer: 'Scalable Vector Graphics',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Graphic Design',
    questionText: 'Which layer blend mode multiplies colors?',
    options: ['Screen', 'Overlay', 'Multiply', 'Soft Light'],
    correctAnswer: 'Multiply',
    difficulty: 'medium'
  },
  {
    categoryType: 'technical',
    domain: 'Graphic Design',
    questionText: 'What is negative space in design?',
    options: ['Black background', 'Empty space around elements', 'Deleted areas', 'Dark mode'],
    correctAnswer: 'Empty space around elements',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Graphic Design',
    questionText: 'Which file format is best for photographs?',
    options: ['PNG', 'JPEG', 'SVG', 'AI'],
    correctAnswer: 'JPEG',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Graphic Design',
    questionText: 'What is typography?',
    options: ['The study of typefaces', 'Photo editing', 'Color theory', '3D modeling'],
    correctAnswer: 'The study of typefaces',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Graphic Design',
    questionText: 'What is a wireframe?',
    options: ['A colored design', 'A basic layout outline', 'A final design', 'A photograph'],
    correctAnswer: 'A basic layout outline',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Graphic Design',
    questionText: 'Which tool is used to draw paths in Illustrator?',
    options: ['Brush Tool', 'Pen Tool', 'Eraser Tool', 'Gradient Tool'],
    correctAnswer: 'Pen Tool',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'Graphic Design',
    questionText: 'What is hierarchy in design?',
    options: ['Ranking system', 'Visual arrangement to show importance', 'File organization', 'Layer management'],
    correctAnswer: 'Visual arrangement to show importance',
    difficulty: 'medium'
  }
];

// AI / ML Developer Questions
const aiMlQuestions = [
  {
    categoryType: 'technical',
    domain: 'AI / ML Developer',
    questionText: 'What does ML stand for?',
    options: ['Machine Learning', 'Manual Learning', 'Multiple Learning', 'Modern Learning'],
    correctAnswer: 'Machine Learning',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'AI / ML Developer',
    questionText: 'What is supervised learning?',
    options: ['Learning without any guidance', 'Learning with labeled data', 'Learning from images', 'Learning from audio'],
    correctAnswer: 'Learning with labeled data',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'AI / ML Developer',
    questionText: 'Which Python library is commonly used for machine learning?',
    options: ['NumPy', 'Pandas', 'Scikit-learn', 'Matplotlib'],
    correctAnswer: 'Scikit-learn',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'AI / ML Developer',
    questionText: 'What is a neural network?',
    options: ['A computer network', 'A system modeled after human brain', 'A database system', 'A web server'],
    correctAnswer: 'A system modeled after human brain',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'AI / ML Developer',
    questionText: 'What is deep learning?',
    options: ['Learning at a deep level', 'Machine learning with neural networks', 'Deep data analysis', 'Advanced programming'],
    correctAnswer: 'Machine learning with neural networks',
    difficulty: 'medium'
  },
  {
    categoryType: 'technical',
    domain: 'AI / ML Developer',
    questionText: 'What is the purpose of the activation function in neural networks?',
    options: ['To speed up training', 'To introduce non-linearity', 'To reduce overfitting', 'To initialize weights'],
    correctAnswer: 'To introduce non-linearity',
    difficulty: 'medium'
  },
  {
    categoryType: 'technical',
    domain: 'AI / ML Developer',
    questionText: 'What is overfitting in machine learning?',
    options: ['When model is too simple', 'When model performs well on training but poorly on test data', 'When training is too fast', 'When data is insufficient'],
    correctAnswer: 'When model performs well on training but poorly on test data',
    difficulty: 'medium'
  },
  {
    categoryType: 'technical',
    domain: 'AI / ML Developer',
    questionText: 'Which algorithm is used for classification problems?',
    options: ['Linear Regression', 'Logistic Regression', 'K-Means', 'PCA'],
    correctAnswer: 'Logistic Regression',
    difficulty: 'medium'
  },
  {
    categoryType: 'technical',
    domain: 'AI / ML Developer',
    questionText: 'What is the purpose of backpropagation in neural networks?',
    options: ['To initialize weights', 'To update weights based on error', 'To prevent overfitting', 'To normalize data'],
    correctAnswer: 'To update weights based on error',
    difficulty: 'medium'
  },
  {
    categoryType: 'technical',
    domain: 'AI / ML Developer',
    questionText: 'What is TensorFlow?',
    options: ['A database', 'An open-source ML framework', 'A web browser', 'A programming language'],
    correctAnswer: 'An open-source ML framework',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'AI / ML Developer',
    questionText: 'What is the difference between classification and regression?',
    options: ['No difference', 'Classification predicts categories, regression predicts continuous values', 'Regression is faster', 'Classification is easier'],
    correctAnswer: 'Classification predicts categories, regression predicts continuous values',
    difficulty: 'medium'
  },
  {
    categoryType: 'technical',
    domain: 'AI / ML Developer',
    questionText: 'What is the purpose of the softmax function?',
    options: ['To normalize output to probability distribution', 'To speed up training', 'To reduce dimensions', 'To select features'],
    correctAnswer: 'To normalize output to probability distribution',
    difficulty: 'hard'
  },
  {
    categoryType: 'technical',
    domain: 'AI / ML Developer',
    questionText: 'What is transfer learning?',
    options: ['Moving data between systems', 'Using pre-trained models for new tasks', 'Learning with limited data', 'Distributed learning'],
    correctAnswer: 'Using pre-trained models for new tasks',
    difficulty: 'medium'
  },
  {
    categoryType: 'technical',
    domain: 'AI / ML Developer',
    questionText: 'Which type of neural network is commonly used for image recognition?',
    options: ['RNN', 'CNN', 'FNN', 'GAN'],
    correctAnswer: 'CNN',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'AI / ML Developer',
    questionText: 'What is the purpose of dropout in neural networks?',
    options: ['To increase accuracy', 'To prevent overfitting', 'To speed up training', 'To initialize weights'],
    correctAnswer: 'To prevent overfitting',
    difficulty: 'medium'
  },
  {
    categoryType: 'technical',
    domain: 'AI / ML Developer',
    questionText: 'What is the role of gradient descent in machine learning?',
    options: ['To calculate derivatives', 'To optimize the loss function', 'To normalize data', 'To select features'],
    correctAnswer: 'To optimize the loss function',
    difficulty: 'medium'
  },
  {
    categoryType: 'technical',
    domain: 'AI / ML Developer',
    questionText: 'What does NLP stand for?',
    options: ['New Learning Process', 'Natural Language Processing', 'Network Learning Protocol', 'Numeric Language Processing'],
    correctAnswer: 'Natural Language Processing',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'AI / ML Developer',
    questionText: 'What is the purpose of data preprocessing in ML?',
    options: ['To make data readable', 'To clean and transform data for better model performance', 'To store data', 'To visualize data'],
    correctAnswer: 'To clean and transform data for better model performance',
    difficulty: 'easy'
  },
  {
    categoryType: 'technical',
    domain: 'AI / ML Developer',
    questionText: 'What is a convolution in CNN?',
    options: ['A type of activation function', 'A mathematical operation to extract features', 'A layer type', 'A regularization technique'],
    correctAnswer: 'A mathematical operation to extract features',
    difficulty: 'hard'
  },
  {
    categoryType: 'technical',
    domain: 'AI / ML Developer',
    questionText: 'What is the purpose of batch normalization?',
    options: ['To normalize batches of data', 'To speed up training and stabilize networks', 'To reduce overfitting', 'To select batch size'],
    correctAnswer: 'To speed up training and stabilize networks',
    difficulty: 'hard'
  }
];

// Domain Cutoffs
const cutoffs = [
  { domain: 'Full Stack Developer', aptitudeCutoff: 4, technicalCutoff: 10, overallCutoff: 14, violationThreshold: 3, approvalWaitMinutes: 5 },
  { domain: 'Networking Security / Cybersecurity', aptitudeCutoff: 4, technicalCutoff: 10, overallCutoff: 14, violationThreshold: 3, approvalWaitMinutes: 5 },
  { domain: 'Graphic Design', aptitudeCutoff: 4, technicalCutoff: 10, overallCutoff: 14, violationThreshold: 3, approvalWaitMinutes: 5 },
  { domain: 'AI / ML Developer', aptitudeCutoff: 4, technicalCutoff: 10, overallCutoff: 14, violationThreshold: 3, approvalWaitMinutes: 5 }
];

async function seedDatabase() {
  try {
    await mongoose.connect(`${mongoUrl}${dbName}`);
    console.log('Connected to MongoDB');

    // Clear existing questions
    await Question.deleteMany({});
    console.log('Cleared existing questions');

    // Insert aptitude questions
    await Question.insertMany(aptitudeQuestions);
    console.log(`Inserted ${aptitudeQuestions.length} aptitude questions`);

    // Insert Full Stack questions
    await Question.insertMany(fullStackQuestions);
    console.log(`Inserted ${fullStackQuestions.length} Full Stack Developer questions`);

    // Insert Cybersecurity questions
    await Question.insertMany(cybersecurityQuestions);
    console.log(`Inserted ${cybersecurityQuestions.length} Cybersecurity questions`);

    // Insert Graphic Design questions
    await Question.insertMany(graphicDesignQuestions);
    console.log(`Inserted ${graphicDesignQuestions.length} Graphic Design questions`);

    // Insert AI/ML questions
    await Question.insertMany(aiMlQuestions);
    console.log(`Inserted ${aiMlQuestions.length} AI/ML Developer questions`);

    // Insert or update cutoffs
    for (const cutoff of cutoffs) {
      await Cutoff.findOneAndUpdate(
        { domain: cutoff.domain },
        cutoff,
        { upsert: true }
      );
    }
    console.log('Inserted cutoff settings');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
