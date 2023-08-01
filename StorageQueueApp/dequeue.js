const { QueueClient } = require("@azure/storage-queue");
const { DefaultAzureCredential } = require("@azure/identity");
const { delay } = require("@azure/core-util");

const queueName = "dstest";
const storageAccountName = "storageappdemodstest"; // Replace with your actual storage account name
const queueURL = `https://${storageAccountName}.queue.core.windows.net`

// Create an instance of DefaultAzureCredential
const defaultAzureCredential = new DefaultAzureCredential();
const queueClient = new QueueClient(queueURL + `/${queueName}`, defaultAzureCredential);

async function cleanupQueue() {
    console.log("\nDeleting Queue")
    const deleteQueueResponse = await queueClient.delete(queueName);
    console.log("Queue Deleted, RequestID:", deleteQueueResponse.requestId);
}

async function deQueueMessages() {
    const maxWait = 32;
    let wait = 1;
    let shouldKeepDequeueing = true;

    const timeoutDuration = 60 * 1000; // 60 seconds (1 minute)

    const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
            shouldKeepDequeueing = false; // Set to false after the timeout duration
            resolve();
        }, timeoutDuration);
    });

    while (shouldKeepDequeueing) {
        const receivedMessageResp = await queueClient.receiveMessages({
            numberOfMessages: 32,
            visibilityTimeout: 5 * 60,
        });

        if (receivedMessageResp.receivedMessageItems.length) {
            wait = 1;

            for (let i = 0; i < receivedMessageResp.receivedMessageItems.length; i++) {
                let message = receivedMessageResp.receivedMessageItems[i];
                console.log("Dequeing Message: ", message.messageText);
                await queueClient.deleteMessage(message.messageId, message.popReceipt);
            }
        } else {
            wait = wait * 2;
            if (wait > maxWait) {
                wait = maxWait;
            }
            console.log(`Wait ${wait} seconds`);
        }

        // Use Promise.race to wait for either the dequeue operation or the timeout to complete
        await Promise.race([delay(wait * 1000), timeoutPromise]);
    }

    console.log("Dequeueing process timed out after 1 minute");
    cleanupQueue();
}

deQueueMessages();


