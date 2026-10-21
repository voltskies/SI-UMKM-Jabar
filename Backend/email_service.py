import os
import requests
from dotenv import load_dotenv

load_dotenv()

EMAILJS_SERVICE_ID = os.getenv("EMAILJS_SERVICE_ID", "service_vr07rh")
EMAILJS_TEMPLATE_ID = os.getenv("EMAILJS_TEMPLATE_ID", "template_318btwq")
EMAILJS_PUBLIC_KEY = os.getenv("EMAILJS_PUBLIC_KEY", "BrC6NgRExKr6v1fz7")
EMAILJS_PRIVATE_KEY = os.getenv("EMAILJS_PRIVATE_KEY", "zYpeOxs0DJs7daltfD0vk")

EMAILJS_API_URL = "https://api.emailjs.com/api/v1.0/email/send"

def send_otp_email(to_email: str, otp_code: str):
    payload = {
        "service_id": EMAILJS_SERVICE_ID,
        "template_id": EMAILJS_TEMPLATE_ID,
        "user_id": EMAILJS_PUBLIC_KEY,
        "accessToken": EMAILJS_PRIVATE_KEY,
        "template_params": {
            "email": to_email,
            "to_email": to_email,
            "passcode": otp_code
        }
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(EMAILJS_API_URL, json=payload, headers=headers, timeout=15)
        
        if response.status_code == 200:
            print(f"[EMAILJS SUKSES] Email OTP terkirim ke {to_email}")
            return True
        else:
            print(f"[EMAILJS GAGAL] Status {response.status_code}: {response.text}")
            raise RuntimeError(f"EmailJS Error ({response.status_code}): {response.text}")

    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
        raise RuntimeError(f"Gagal mengirim email: {str(e)}")