const examplesData = [
    {
        program: "IT Web Programming",
        area: "Web & Application Development",
        courseCode: "PROG 2700",
        courseName: "Client Side Programming",
        objective: "Develop client-side applications that retrieve and send data to a web API through a variety of different data exchange formats.",
        enhancement: "Students learn real-world API consumption, async fetching, and JSON parsing using a state-of-the-art Qwen 32B model, without the college or student incurring third-party API costs.",
        oldWay: "A student builds a fake, static website for a pizza shop using placeholder text to demonstrate they know how to code layout and buttons.",
        newWay: "A student builds a fully functional Customer Service Chatbot for the pizza shop that connects to the on-campus AI to answer customer questions in real-time."
    },
    {
        program: "IT Web Programming",
        area: "Web & Application Development",
        courseCode: "INET 2005",
        courseName: "Web Application Programming I",
        objective: "Build web applications that send and/or receive data.",
        enhancement: "Instead of building 'toy' integrations with fake placeholder data, students can send JSON requests to the local AI cluster's API and build live, intelligent web apps.",
        oldWay: "A student uses fake JSON files to simulate receiving weather data on a web page.",
        newWay: "A student builds an intelligent travel advisory app that feeds user input to the local AI cluster to dynamically generate custom itinerary JSON data on the fly."
    },
    {
        program: "IT Systems Management and Security",
        area: "Advanced Projects & Capstone",
        courseCode: "INFT 3000",
        courseName: "Capstone",
        objective: "Create a product (application, website, report, demonstration, etc.) that meets all approved project milestones.",
        enhancement: "By providing a powerful on-prem AI cluster, students have the computational horsepower to build advanced agentic workflows locally. They learn pipeline parallelism and complex prompt engineering.",
        oldWay: "A student team builds a basic web portal that lets a user manually search through a database using SQL.",
        newWay: "The team builds an 'Agentic AI Analyst' that automatically reads 100GB of enterprise data, identifies anomalies, and generates a summarized report for the user, all processed locally."
    },
    {
        program: "IT Systems Management and Security",
        area: "IT Security & Networking",
        courseCode: "NETW 1027",
        courseName: "Introduction to Networking and Security",
        objective: "Identify current security requirements to support IT operations by analyzing current threats and mitigation strategies.",
        enhancement: "The on-prem cluster provides a tangible case study for 'Data Privacy by Design'. Students learn how to deploy and utilize AI mitigation strategies to ensure sensitive corporate or student data never leaks to public models.",
        oldWay: "Students read a textbook chapter about how companies can accidentally leak proprietary data to public AI companies like OpenAI.",
        newWay: "Students actually deploy a local firewall and route traffic to the NSCC AI Cluster, physically verifying that an AI application can run entirely disconnected from the internet, guaranteeing zero data leakage."
    },
    {
        program: "IT Programming",
        area: "Systems Integration",
        courseCode: "MOBI 3002",
        courseName: "Mobile Application Development - Android",
        objective: "Develop an Android application that demonstrates data storage and retrieval using one or more of the following technologies: Local or cloud database/API.",
        enhancement: "Mobile development students can build intelligent Android apps that maintain context by communicating with the local cluster's API. This simulates real-world mobile AI integration entirely within the campus network.",
        oldWay: "A student builds a basic note-taking app that saves text to a local SQLite database on the phone.",
        newWay: "A student builds a 'Smart Study Companion' app that sends the student's notes to the NSCC AI Cluster, which then generates custom flashcards and quizzes, sending them back to the phone instantly."
    },
    {
        program: "Marine Geomatics",
        area: "Geographic Information Systems",
        courseCode: "MGEO 6025",
        courseName: "Digital Mapping",
        objective: "Utilize mapping software at an advanced level to perform spatial analysis and generate marine related mapping products.",
        enhancement: "Marine Geomatics involves incredibly dense datasets (like LiDAR or multibeam sonar data). Students can use Python scripting to pipe this data into the AI cluster to automate advanced spatial analysis.",
        oldWay: "A student manually traces contours on a bathymetric survey over the course of several days to identify underwater navigational hazards.",
        newWay: "A student writes a Python script that feeds raw multibeam sonar data into the local AI cluster, which instantly analyzes the topography and outputs an automated risk assessment report and flagged hazard map."
    },
    {
        program: "Marine Geomatics",
        area: "Data Engineering",
        courseCode: "MGEO 5004",
        courseName: "Computer Essentials for Marine Geomatics",
        objective: "Apply scripting language strategies to investigate data and solve data challenges.",
        enhancement: "Students learn how to use AI for data transformation and cleaning, acting as a massive accelerator for data engineering pipelines.",
        oldWay: "A student writes complex regex scripts to manually parse corrupted GPS coordinate strings over several hours.",
        newWay: "A student prompts the local AI cluster via API to automatically identify and repair malformed spatial data formats across a 10,000-line dataset in seconds."
    },
    {
        program: "IT Systems Management and Security",
        area: "Professional Practice",
        courseCode: "ICOM 2701",
        courseName: "Professional Practice for IT I",
        objective: "Communicate information using established professional processes and templates as required by the IT industry.",
        enhancement: "Students learn how modern IT professionals use AI as a drafting assistant while adhering to strict corporate data compliance policies.",
        oldWay: "A student spends hours manually formatting a mock IT incident report from scratch in a word processor.",
        newWay: "A student feeds raw, technical diagnostic logs into the secure on-campus AI, which instantly drafts a perfectly formatted, executive-ready incident report without exposing simulated corporate data to the public internet."
    },
    {
        program: "Geospatial Data Analytics",
        area: "Data Mining",
        courseCode: "GDAA 2000",
        courseName: "Data Mining Fundamentals",
        objective: "Use data analytics modelling tools to gain new insight resulting from data.",
        enhancement: "Students learn how to use Large Language Models for unstructured data mining, dramatically speeding up traditional text-based geostatistical extraction.",
        oldWay: "A student writes a script to count the frequency of specific keywords in a dataset to categorize locations.",
        newWay: "A student prompts the local AI cluster to semantically analyze 10,000 messy textual survey reports and extract cleanly structured JSON geospatial coordinates and sentiment tags."
    },
    {
        program: "IT Programming",
        area: "Object-Oriented Programming",
        courseCode: "PROG 1400",
        courseName: "Introduction to Object Oriented Programming",
        objective: "Implement object-oriented design principles in applications.",
        enhancement: "Students can build Agentic Object-Oriented architectures, treating AI models as active 'objects' or agents within their codebase.",
        oldWay: "A student builds a static 'Enemy' class for a game that uses hard-coded if/else statements to determine its behavior.",
        newWay: "A student builds an 'Enemy' class that instantiates a connection to the local AI cluster, giving the NPC dynamic, conversational intelligence and unpredictable strategy."
    },
    {
        program: "IT Systems Management and Security",
        area: "IT Systems Management",
        courseCode: "CSTN 4015",
        courseName: "Help Desk and Customer Support",
        objective: "Automate and standardize the IT Help Desk environment.",
        enhancement: "Students learn to deploy LLMs as autonomous Tier-1 IT Support agents capable of resolving common ticketing issues locally.",
        oldWay: "A student writes a simple flowchart or basic script to automate password resets.",
        newWay: "A student fine-tunes an open-source AI model on a mock corporate knowledge base to autonomously resolve Tier-1 support tickets via a chat interface."
    },
    {
        program: "IT Systems Management and Security",
        area: "Networking & Automation",
        courseCode: "NETW 3700",
        courseName: "Hierarchical Network Infrastructure",
        objective: "Explain how network automation is enabled through RESTful APIs and configuration management tools.",
        enhancement: "Students use the AI Cluster API to build intelligent network scripts that can self-heal or dynamically adjust routing configurations based on natural language commands.",
        oldWay: "A student writes a static Python script using Netmiko to pull the running-config from a single Cisco switch.",
        newWay: "A student builds an AI-driven Ansible playbook that detects network anomalies, queries the local AI cluster for the optimal mitigation strategy, and pushes the new configuration via REST APIs."
    },
    {
        program: "IT Systems Management and Security",
        area: "Information Security",
        courseCode: "ISEC 2700",
        courseName: "Introduction to Information Security Practices",
        objective: "Troubleshoot security incidents and events to prevent further risks.",
        enhancement: "Students can feed massive, complex SIEM (Security Information and Event Management) logs into the AI cluster to instantly detect patterns of compromise.",
        oldWay: "A student manually parses through thousands of lines of raw Syslog data using grep to find the IP address of an attacker.",
        newWay: "A student builds an automated pipeline that streams live firewall logs to the local AI cluster, which instantly flags anomalous traffic patterns and drafts a customized incident response playbook."
    }
];
