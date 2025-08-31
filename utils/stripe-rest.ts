export async function stripeREST(
  path: string,
  init: RequestInit & { form?: Record<string, string | undefined | string[]> } = {}
) {
  const headers: Record<string, string> = {
    Authorization: `Bearer sk_test_51S1WY4LXf2zqDfstDgX5xKROtt9CpkelDEGCQvODLu3bd5q9lrmoNyxOoBE4aLfZVi4hbAICPU8V7oSlFI2JlaPb00nDggRt8A`,
  };
  let body = init.body as BodyInit | undefined;

  // Support x-www-form-urlencoded for POST
  if (init.method && init.method.toUpperCase() !== "GET") {
    const form = new URLSearchParams();
    if (init.form) {
      for (const [k, v] of Object.entries(init.form)) {
        if (Array.isArray(v)) v.forEach((x) => form.append(`${k}[]`, x));
        else if (v != null) form.append(k, String(v));
      }
    }
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = form.toString();
  }

  const url = `https://api.stripe.com${path}` +
    (init.method?.toUpperCase() === "GET" && init.form
      ? `?${new URLSearchParams(
          Object.entries(init.form).flatMap(([k, v]) =>
            Array.isArray(v) ? v.map((x) => [`${k}[]`, String(x)]) : [[k, String(v!)]]
          )
        ).toString()}`
      : "");

  const res = await fetch(url, { ...init, body, headers });
  const json = await res.json();
  if (!res.ok) {
    const msg = json?.error?.message || `Stripe REST error ${res.status}`;
    return Response.json({ error: msg, raw: json }, { status: res.status });
  }
  return Response.json(json);
}


