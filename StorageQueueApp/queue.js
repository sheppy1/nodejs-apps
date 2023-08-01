const { QueueServiceClient, QueueClient } = require("@azure/storage-queue");
const { DefaultAzureCredential } = require("@azure/identity");
const { delay } = require("@azure/core-util");

const queueName = process.env.STORAGE_QUEUE_NAME;
const storageAccountName = process.env.STORAGE_ACCOUNT_NAME;
const queueURL = `https://${storageAccountName}.queue.core.windows.net`
let addItemsToQueue = true


// Create an instance of DefaultAzureCredential
const defaultAzureCredential = new DefaultAzureCredential();

// Construct the QueueClient with the correct storage URL and queueName
const queueServiceClient = new QueueServiceClient(queueURL, defaultAzureCredential);

async function createQueue() {
  try {
    // Check if the queue already exists
    const queueClient = queueServiceClient.getQueueClient(queueName);
    await queueClient.getProperties();

    console.log("Queue already exists:", queueName);
    // Add any additional code here that you want to execute when the queue already exists

  } catch (error) {
    if (error.statusCode === 404) {
      // Queue does not exist, create it
      console.log("\nCreating Queue...");
      console.log("\t", queueName);

      try {
        const createQueueResponse = await queueServiceClient.createQueue(queueName);
        console.log("Queue Created, requestId:", createQueueResponse.requestId);
        // Add any additional code here that you want to execute after the queue creation
      } catch (error) {
        console.error("Error creating queue:", error);
        // Handle any errors that might occur during the queue creation
      }
    } else {
      // Handle other errors (e.g., network issues, authorization problems, etc.)
      console.error("Error checking queue existence:", error);
    }
  }
}

async function addQueueMessages() {
    const queueClient = new QueueClient(queueURL + `/${queueName}`, defaultAzureCredential);

    let x = 0

    while (addItemsToQueue) {
        x++
        let msg = `Message ${x} queued`
        console.log(msg)
        await queueClient.sendMessage(msg)
        await delay(1000)

        if (x == 20) {
          console.log("Message Queue Test Completed. Exiting Now")
          break
        }
    }
    console.log("\n Adding messages into the queue...")
}

createQueue();
addQueueMessages();
