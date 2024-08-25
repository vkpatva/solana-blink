import { ActionGetResponse, ActionPostRequest, ActionPostResponse, ACTIONS_CORS_HEADERS, createPostResponse, MEMO_PROGRAM_ID } from "@solana/actions"
import { clusterApiUrl, ComputeBudgetProgram, Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";

export const GET = (req: Request) => {
    const payload: ActionGetResponse = {
        icon: new URL("/vercel.svg", new URL(req.url).origin).toString(),
        label: "Send Memo",
        description: "This is super simple action",
        title: "memo demo",
        type: "action"
    }
    return Response.json(payload, {
        headers: ACTIONS_CORS_HEADERS
    })
}

export const OPTIONS = GET;

export const POST = async (req: Request) => {

    try {
        const body: ActionPostRequest = await req.json();

        let account: PublicKey;

        try {
            account = new PublicKey(body.account);
        } catch (err) {
            return new Response('Invalid account', {
                status: 400,
                headers: ACTIONS_CORS_HEADERS
            })
        }
        const transaction = new Transaction();
        transaction.add(

            ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: 1000,
            }),

            new TransactionInstruction({
                programId: new PublicKey(MEMO_PROGRAM_ID),
                data: Buffer.from('this is simple memo message', 'utf8'),
                keys: []
            })
        )
        transaction.feePayer = account;
        const connection = new Connection(clusterApiUrl('devnet'))
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
        const payload: ActionPostResponse = await createPostResponse({
            fields: {
                transaction
            }
        })
        return Response.json(payload, {
            headers: ACTIONS_CORS_HEADERS
        })

    } catch (err) {
        return Response.json("An unkown error occured", { status: 400 })
    }
}