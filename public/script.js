const form = document.getElementById("leadForm");
const submitBtn = document.getElementById("submitBtn");
const loading = document.getElementById("loading");
const result = document.getElementById("result");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    result.innerHTML = "";

    const caller_id = document.getElementById("caller_id").value.trim();
    const zipcode = document.getElementById("zipcode").value.trim();
    const state = document.getElementById("state").value;

    // Validation
    if (!caller_id.startsWith("+1")) {
        result.innerHTML = `
            <div class="error">
                Caller ID must start with <strong>+1</strong>.
            </div>
        `;
        return;
    }

    if (zipcode.length !== 5) {
        result.innerHTML = `
            <div class="error">
                ZIP Code must be 5 digits.
            </div>
        `;
        return;
    }

    if (!state) {
        result.innerHTML = `
            <div class="error">
                Please select a state.
            </div>
        `;
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = "Requesting...";
    loading.style.display = "block";

    const startTime = Date.now();

    try {
        const response = await fetch("/api/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                caller_id,
                zipcode,
                state
            })
        });

        const data = await response.json();

        const responseTime = Date.now() - startTime;

        loading.style.display = "none";
        submitBtn.disabled = false;
        submitBtn.innerText = "Request DID";

        // Accepted
        if (data.status === "accepted" || (data.marketwave && data.marketwave.status === "accepted")) {

            const mw = data.marketwave || data;

            result.innerHTML = `
                <div class="success">

                    <h2>✅ Buyer Accepted</h2>

                    <p><strong>DID Number</strong></p>

                    <div class="did">${mw.number}</div>

                    <br>

                    <p><strong>Dynamic Bid:</strong> ${mw.dynamicBid}</p>

                    <p><strong>Duration:</strong> ${mw.dynamicDuration} sec</p>

                    <p><strong>Response Time:</strong> ${responseTime} ms</p>

                    <br>

                    <button id="copyBtn">Copy DID</button>

                </div>
            `;

            document.getElementById("copyBtn").addEventListener("click", () => {
                navigator.clipboard.writeText(mw.number);
                alert("DID copied to clipboard.");
            });

            return;
        }

        // Rejected
        const mw = data.marketwave || data;

        result.innerHTML = `
            <div class="error">

                <h2>❌ Buyer Rejected</h2>

                <p><strong>Status:</strong> ${mw.status || "Rejected"}</p>

                <p><strong>Message:</strong></p>

                <p>${mw.message || mw.rejectReason || "Unknown error"}</p>

                <br>

                <p><strong>Online Agents:</strong> ${mw.totalOnlineAgents ?? "N/A"}</p>

                <p><strong>State:</strong> ${mw.state || state}</p>

                <p><strong>Response Time:</strong> ${responseTime} ms</p>

            </div>
        `;

    } catch (err) {

        loading.style.display = "none";
        submitBtn.disabled = false;
        submitBtn.innerText = "Request DID";

        result.innerHTML = `
            <div class="error">

                <h2>Server Error</h2>

                <p>${err.message}</p>

            </div>
        `;
    }
});