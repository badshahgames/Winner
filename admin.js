import { db, collection, query, where, onSnapshot, updateDoc } from "./firebase-config.js";

// Monitor withdrawals
const q = query(collection(db, "withdrawals"), where("status", "==", "pending"));
onSnapshot(q, (snapshot) => {
    const container = document.getElementById('withdrawalRequests');
    container.innerHTML = '';
    
    snapshot.forEach(doc => {
        const request = doc.data();
        container.innerHTML += `
            <div class="request">
                <p>User: ${request.userId}</p>
                <p>Amount: ₹${request.amount}</p>
                <p>UPI: ${request.upiId}</p>
                <button onclick="approveRequest('${doc.id}')">Approve</button>
            </div>
        `;
    });
});

window.approveRequest = async (requestId) => {
    await updateDoc(doc(db, "withdrawals", requestId), {
        status: "approved"
    });
};
