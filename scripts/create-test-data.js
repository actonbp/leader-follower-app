const { models, connectToDatabase, initializeDatabase } = require('../db-neon');

async function createTestData() {
  try {
    await connectToDatabase();
    await initializeDatabase();
    
    // Check if user already exists to avoid duplicates
    const existingData = await models.UserData.findAll({
      where: { userId: "TEST01" }
    });
    
    if (existingData.length > 0) {
      console.log(`Test user TEST01 already has ${existingData.length} records.`);
      console.log("Deleting existing records before creating new ones...");
      
      await models.UserData.destroy({
        where: { userId: "TEST01" }
      });
    }
    
    // Create entries over multiple days with varying scores
    const testData = [
      {
        userId: "TEST01",
        startTime: "2025-03-01T09:00:00Z",
        submitTime: "2025-03-01 09:10:00",
        leaderScore: "75",
        followerScore: "25",
        novelty: "5",
        disruption: "3",
        ordinariness: "2",
        eventDescription: "Led team meeting, proposed new project ideas"
      },
      {
        userId: "TEST01",
        startTime: "2025-03-02T10:00:00Z",
        submitTime: "2025-03-02 10:15:00",
        leaderScore: "65",
        followerScore: "35",
        novelty: "4",
        disruption: "3",
        ordinariness: "3",
        eventDescription: "Follow-up discussions on project implementation"
      },
      {
        userId: "TEST01",
        startTime: "2025-03-03T09:30:00Z",
        submitTime: "2025-03-03 09:40:00",
        leaderScore: "45",
        followerScore: "55",
        novelty: "2",
        disruption: "4",
        ordinariness: "5",
        eventDescription: "Attended training session led by manager"
      },
      {
        userId: "TEST01",
        startTime: "2025-03-04T11:00:00Z",
        submitTime: "2025-03-04 11:20:00",
        leaderScore: "30",
        followerScore: "70",
        novelty: "3",
        disruption: "2",
        ordinariness: "4",
        eventDescription: "Followed instructions for implementing new processes"
      },
      {
        userId: "TEST01",
        startTime: "2025-03-05T09:15:00Z",
        submitTime: "2025-03-05 09:30:00",
        leaderScore: "55",
        followerScore: "45",
        novelty: "4",
        disruption: "3",
        ordinariness: "3",
        eventDescription: "Balanced role in team collaboration session"
      }
    ];
    
    // Insert all test data entries
    for (const entry of testData) {
      await models.UserData.create(entry);
    }
    
    // Also create email preferences for the test user
    const [preference, created] = await models.EmailPreference.findOrCreate({
      where: { userId: "TEST01" },
      defaults: {
        wantsReminders: true,
        userEmail: "test01@example.com",
        reminderTime: "09:00",
        updatedAt: new Date()
      }
    });
    
    if (!created) {
      await preference.update({
        wantsReminders: true,
        userEmail: "test01@example.com",
        reminderTime: "09:00",
        updatedAt: new Date()
      });
    }
    
    console.log("Test data created successfully for user TEST01");
    console.log("5 reflection entries created over 5 days");
    console.log("Email preferences set up with test01@example.com");
    console.log("");
    console.log("You can now use the TEST01 ID in the application to see visualizations");
    console.log("Details about the test data are in ai_captures/TEST01_INFO.md");
    console.log("");
    console.log("Next steps:");
    console.log("1. Start the server: npm run dev:neon");
    console.log("2. Take screenshots: npm run ai-capture");
    console.log("3. View the screenshots in the ai_captures directory");
  } catch (error) {
    console.error("Error creating test data:", error);
  }
}

// Run the function
createTestData().catch(console.error);