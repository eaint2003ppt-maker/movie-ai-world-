export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        const { feature, quality, title, prompt, byokKey } = body;

        // User ၏ BYOK Key ရှိလျှင် ဦးစားပေးသုံးပြီး မရှိမှ Server Environment Key ကိုသုံးမည်
        const apiKey = byokKey || context.env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({
                result: `[${feature} - ${quality}]\n` +
                        `ခေါင်းစဉ်: ${title}\n` +
                        `မြန်မာဘာသာ AI ဇာတ်လမ်းအကျဉ်းနှင့် အသံထွက် Script အသင့်ဖြစ်ပါပြီ။\n` +
                        `(တိုက်ရိုက် AI ချိတ်ဆက်ရန် BYOK ကဏ္ဍတွင် သင့် Gemini API Key ထည့်သွင်းပါ)`
            }), { headers: { "Content-Type": "application/json" } });
        }

        // Google Gemini API သို့ တိုက်ရိုက်လှမ်းခေါ်ခြင်း
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const systemInstruction = `သင်သည် ကျွမ်းကျင်သော မြန်မာရုပ်ရှင် Recap နှင့် AI Video Script ရေးသားသူဖြစ်သည်။ တောင်းဆိုချက် (${feature}) ကို အရည်အသွေး (${quality}) စံနှုန်းဖြင့် ဆွဲဆောင်မှုရှိသော မြန်မာစကားပြောဟန်ဖြင့် အသေးစိတ် ရေးသားပေးပါ။`;

        const response = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemInstruction}\n\nTitle: ${title}\nPrompt: ${prompt}` }] }]
            })
        });

        const data = await response.json();
        const outputText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "AI ထုတ်လုပ်မှု မအောင်မြင်ပါ။ API Key ပြန်စစ်ပေးပါ။";

        return new Response(JSON.stringify({ result: outputText }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
