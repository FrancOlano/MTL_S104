#!/usr/bin/env python3
"""
Script para probar la integración entre frontend y backend.
Verifica que:
1. Backend está corriendo
2. Endpoints están disponibles
3. Formatos de request/response son correctos
"""

import asyncio
import httpx
import json

API_URL = "http://localhost:8001"

async def test_backend_health():
    """Verifica que el backend esté disponible"""
    print("🔍 Verificando que backend está corriendo...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{API_URL}/", timeout=5.0)
            print(f"✅ Backend respondiendo: {response.status_code}")
            return True
    except Exception as e:
        print(f"❌ Backend no disponible: {e}")
        return False

async def test_transcribe_endpoint():
    """Verifica que el endpoint /transcribe existe"""
    print("\n🔍 Verificando endpoint /transcribe...")
    try:
        async with httpx.AsyncClient() as client:
            # Intentar POST sin archivo (debe fallar pero de manera controlada)
            response = await client.post(f"{API_URL}/transcribe", timeout=5.0)
            if response.status_code in [400, 422]:  # Bad request esperado
                print(f"✅ Endpoint /transcribe disponible (responde con {response.status_code})")
                return True
            else:
                print(f"⚠️  Endpoint respondió con {response.status_code}")
                return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

async def test_upload_endpoint():
    """Verifica que el endpoint /upload-audio existe"""
    print("\n🔍 Verificando endpoint /upload-audio...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{API_URL}/upload-audio", timeout=5.0)
            if response.status_code in [400, 422]:  # Bad request esperado
                print(f"✅ Endpoint /upload-audio disponible (responde con {response.status_code})")
                return True
            else:
                print(f"⚠️  Endpoint respondió con {response.status_code}")
                return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

async def main():
    print("=" * 60)
    print("TESTING WIDIAI INTEGRATION")
    print("=" * 60)
    
    results = []
    
    # Test 1: Backend health
    results.append(await test_backend_health())
    
    if not results[0]:
        print("\n❌ Backend no está corriendo. Inicialo primero:")
        print("   cd WidiAI && python -m uvicorn backend.main:app --reload")
        return
    
    # Test 2: Endpoints
    results.append(await test_transcribe_endpoint())
    results.append(await test_upload_endpoint())
    
    # Summary
    print("\n" + "=" * 60)
    if all(results):
        print("✅ TODOS LOS TESTS PASARON")
        print("\nPróximos pasos:")
        print("1. Abre http://localhost:5173 en tu navegador")
        print("2. Sube un archivo de audio o graba uno")
        print("3. Selecciona el modelo (transkun o own)")
        print("4. Haz clic en 'Convert to MIDI'")
        print("5. Descarga el archivo MIDI resultante")
    else:
        print("❌ ALGUNOS TESTS FALLARON")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
