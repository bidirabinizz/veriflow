import requests
import json

def test_api():

    API_KEY = "cw_1321282496033738cff7725d491afcab8efbbe9deafe6435"
    
    base_url = "http://localhost:5000"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    print("🚀 API Testi Başlıyor...")
    print("=" * 50)
    
    try:
        # 1. Test endpoint
        print("1. Bağlantı Testi:")
        response = requests.get(f"{base_url}/api/test", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ API Bağlantısı Başarılı!")
            print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        else:
            print(f"❌ Hata: {response.text}")
        
        print("\n" + "=" * 50)
        
 
        print("2. Lisans Doğrulama Testi:")
        license_data = {
            "license_key": "VERIFLOW-JFGSN4H43",
            "hwid": "TEST_HWID_456"
        }
        
        response = requests.post(
            f"{base_url}/api/verify-license", 
            headers=headers, 
            json=license_data
        )
        print(f"Status: {response.status_code}")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        
    except Exception as e:
        print(f"❌ Hata: {e}")

if __name__ == "__main__":
    test_api()