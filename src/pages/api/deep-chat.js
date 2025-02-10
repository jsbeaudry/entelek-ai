import ollama from "ollama";

// Set the runtime to "edge" for edge-compatible execution
export const runtime = "edge";

// Disable body parsing for the API route
export const config = {
  api: {
    bodyParser: false,
  },
};

// Default handler for the API route
export default async function handler(req) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Parse the request body to extract prompt, image, history, pdfdoc, and ai settings
    const { prompt, image, history, pdfdoc, ai } = await req.json();

    let imgResp = ""; // Variable to store image description
    let newPrompt = ""; // Variable to store the final prompt

    // If an image is provided, process it using the Ollama vision model
    if (image) {
      // Convert the base64 image string to a buffer
      const imageBuffer = Buffer.from(
        image.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );

      // Send the image to the Ollama vision model for description
      const res = await ollama.chat({
        model: ai?.vision, // Use the vision model specified in the request
        messages: [
          {
            role: "user",
            content: "Describe this image:",
            images: [imageBuffer], // Attach the image buffer
          },
        ],
      });

      imgResp = res.message.content; // Store the image description
    }

    console.log(imgResp); // Log the image description for debugging

    // Construct the new prompt based on the image description or PDF document
    if (imgResp) {
      newPrompt = `${prompt}  : ${imgResp}`; // Append image description to the prompt
    } else if (pdfdoc) {
      console.log(pdfdoc); // Log the PDF document for debugging
      newPrompt = `${prompt} : ${pdfdoc}`; // Append PDF document to the prompt
    } else {
      newPrompt = prompt; // Use the original prompt if no image or PDF is provided
    }

    // Create a TransformStream for handling the streaming response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Create a streaming response with appropriate headers
    const response = new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream", // Set content type to SSE (Server-Sent Events)
        "Cache-Control": "no-cache", // Disable caching
        Connection: "keep-alive", // Keep the connection alive
      },
    });

    // Define the base history for the chat, including a system message
    let basedHist = [
      {
        role: "system",
        content: `You are my assistant. Please Well format answer using markdown. Current language: ${
          ai?.language || "english"
        }.`,
      },
    ];

    // Concatenate the provided chat history with the base history
    basedHist = basedHist.concat(history);

    // Send the new prompt to the Ollama LLM for completion
    const completion = await ollama.chat({
      model: ai?.llm, // Use the LLM model specified in the request
      messages: [
        ...basedHist, // Include the base history and user history
        {
          role: "user",
          content: newPrompt, // Include the final prompt
        },
      ],
      stream: true, // Enable streaming response
    });

    // console.log(completion); // Log the completion object for debugging

    // Handle the streaming response from the Ollama LLM
    (async () => {
      try {
        // Iterate over each chunk of the streaming response
        for await (const chunk of completion) {
          const content = chunk.message.content || "";

          // Format the chunk and write it to the stream
          const data = `data: ${JSON.stringify({
            content: content
              .replace("<think>", "I'm thinking: ") // Replace custom tags
              .replace("</think>", "^^^^^^^"),
          })}\n\n`;
          await writer.write(encoder.encode(data)); // Write the chunk to the stream
        }

        // Signal the end of the stream
        await writer.write(encoder.encode("data: [DONE]\n\n"));
        await writer.close(); // Close the stream writer
      } catch (error) {
        console.error("Stream error:", error); // Log any stream errors
        const errorData = `data: ${JSON.stringify({
          error: error.message, // Send the error message to the client
        })}\n\n`;
        await writer.write(encoder.encode(errorData)); // Write the error to the stream
        await writer.close(); // Close the stream writer
      }
    })();

    // Return the streaming response
    return response;
  } catch (error) {
    console.error("Error:", error); // Log any unexpected errors
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500, // Return a 500 Internal Server Error
      headers: { "Content-Type": "application/json" }, // Set the response content type
    });
  }
}
