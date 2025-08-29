import Link from "next/link";


export default function Page() {
    return (
        <main className="max-w-xl mx-auto p-6">
            <h1 className="text-3xl font-bold">Payment complete</h1>
            <p className="text-slate-500 mt-2">You can close this tab or return home.</p>
            <Link href="/" className="inline-block mt-6 underline">Back home</Link>
        </main>
    );
}