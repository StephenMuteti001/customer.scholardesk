# Academic Hub Refined

I need to revamp the look and workflow(s) for my Academic Hub client site/platform/portal (https://client.academichubpro.com). In essence, I need to make the following changes to it:

1. Currently the client submits the order together with their own budget after they have been presented with a minimum budget. However this feels robotic without any human intervention.

I need to ensure that the client submits the order and gets the quote/quotation/budget from the Academic Hub team. We should be very clear and vivid with the steps here.

We need to present the client with a clear process/procedure thorugh which their order goes untill quality work is submitted to them. The client never deals directly with the writer. They submit their order to the Academic Hub team which matches their order with the right/befitting writer.

The assigned writer handles the task and submits their work to Academic Hub team for review for AI generated content and plaggiarism. The Academic Hub team decides whether the work should be redone (revision) or submitted to the client. For revision, the Academic Hub team communicates that to the writer else they submit the submission to the client.

The client could also request for rework on the work after the Academic Hub team submits it to them which the Academic Hub team escalates to the writer.

This ensures everyones protection (both client and writer)

2. The client will be requested to pay the quotation budget should they agree on one with the Academic Hub team. This budget conversation should/can even take place on email or the platforms chat service.

3. I need to restructure my chat to point to the fact that the client is chatting/texting with a member of the Academic Hub support team and not at any point a writer.

Again, a list of the chats (the chat titles) should be listed on a panel and then upon clicking a list item it should now open that particular chat content on a side panel (that looks like the one that opens for dedicated chat solutions like tawk.to, MyLiveChat etc). The chat floating button/trigger should appear at the bottom right to avoid blocking any content for heightened UI/UX.

So on clicking the chat trigger it should open a panel that contains a list of chats and their status (open, closed, archived etc). The chat can be closed or archived only after the chat issue has been dealt with or resolved. The last chat message can be shown (at most a single line with ellipsis for messages that span more than a line for UI/UX reasons).

When a chat listing is clicked on, we open the chat and load its messages. Opening the chat this time dismisses the chat listing and showns only that particular chat content/messages.

4. Only orders that have been converted should be shown as orders. Those that have been submitted for quotations and quotations are yet to be made should be named appropriately eg open orders.

Orders should contain a payment status (paid, not paid etc) to show whether the client has made the payment for the order or not yet. We should show a clear refund message or process to the client in case of unsatisfaction.

We should now therefore do away with the Wallet page completely since we can always present clients with a way to pay us later.

5. We maintain the order management actions (edit, cancel, etc). The client can make alterations to the order but negotiations should resume in case of scope creep.

This scope creep will be discussed on the chat again initiated by the support team after identifying the creep.

6. The client should be able to view the submissions for a particular order and request for revision(s). The design should be improved here so that its interactive and comfortable for the client

NB:

Make the design enterprise grade and corporate level for UI/UX. Ensure the actions on any order based on it's phase on the order workflow procedure are presented conveniently.

Both dark and light theme designs should be very well thought and not detract from clarity or waste space.

We should make use of the existing good attributes of our current design and improve where necessary.

The current system works well including the backend API implementation(s). The API call(s) should be made in the same manner preserving the use for cookis and all other tech but clearly document any API changes/alterations/additions to be made.

The current client platform code repo is https://github.com/Stephen-Muteti254/client.academichub

Look at it clearly and deeply to identify everything. You can now focus on using tanstack for routing, query etc.

Improve the entire design for modernity and simplicity and ease of navigation

Make sure all styling is professional and that all loading features skeleton designs for modernity and premium designs

To further help in understanding what the client should submit for each order, llok at the form content and fields below:

Assignment Help

Send the brief. Get a quote. Approve when you're ready.

Essays, case studies, problem sets, lab reports, presentations and code — matched to a specialist who has done it before.

Assignment quote request

No payment is taken until you accept the quote.

Full name

Email

Assignment title

Subject area

Assignment type

Word count / pages

Citation style

Deadline

Brief, rubric or reading list

Drag & drop your document here

PDF, DOCX or TXT — up to 25MB

Attach everything your tutor gave you.

(file input)

Instructions

(Text Area (styled professionally))

Get my Quote

We reply with a quote and plan — usually within 30 minutes.

What happens next

Four simple steps

    Step 1

    You submit the brief and deadline.

    Step 2

    We match a specialist in your subject.

    Step 3

    You receive a quote and delivery schedule.

The form is at https://id-preview--07b78d2b-508c-4350-bbfe-13ab3fe881a9.lovable.app/assignment-help

You can restyle/redesign it to match what you are going for for this client site

Choose the most prestigious designs and styles since we are on a paid plan

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6851b7d3-d693-43d7-82ca-02134d0e6176).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
