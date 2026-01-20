# Superchain Token Explorer - Kurulum Kılavuzu

## Genel Bakış

Bu proje, Superchain / OP Stack odaklı bir token ve DeFi explorer'ıdır. Proje üç ana bileşenden oluşur:

1. **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
2. **Backend**: FastAPI (Python) + SQLAlchemy + PostgreSQL
3. **Data Ingestion**: Python worker script (periyodik veri toplama)

## Sistem Gereksinimleri

- Docker ve Docker Compose
- Node.js 20+ (frontend için)
- Python 3.11+ (backend için, Docker kullanıyorsanız gerekmez)

## Hızlı Başlangıç (Docker ile)

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/serayd61/superchain-token-explorer.git
cd superchain-token-explorer
```

### 2. Environment Dosyalarını Oluşturun

Root dizinde `.env` dosyası oluşturun:

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin ve gerekli değerleri girin:

```env
# Database
DB_PASSWORD=superchain_password

# Chain RPC URLs (Alchemy veya Infura kullanabilirsiniz)
CHAIN_BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
CHAIN_OPTIMISM_RPC_URL=https://opt-mainnet.g.alchemy.com/v2/YOUR_KEY
CHAIN_MODE_RPC_URL=https://mode-mainnet.g.alchemy.com/v2/YOUR_KEY
CHAIN_ZORA_RPC_URL=https://zora-mainnet.g.alchemy.com/v2/YOUR_KEY

# External APIs
COINGECKO_API_KEY=optional_if_using_free_tier

# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Debug
DEBUG=false
```

Frontend için `.env.local` dosyası oluşturun:

```bash
cp .env.local.example .env.local
```

### 3. Docker Compose ile Servisleri Başlatın

```bash
docker-compose up -d
```

Bu komut şunları başlatır:
- PostgreSQL veritabanı (port 5432)
- FastAPI backend (port 8000)
- Next.js frontend (port 3000)

### 4. Veritabanı Migration'larını Uygulayın

```bash
docker-compose exec backend alembic upgrade head
```

### 5. İlk Veri Toplamayı Çalıştırın

```bash
docker-compose exec backend python -m app.ingestion.worker --once
```

**Not**: Worker script şu anda manuel token listesi bekliyor. Token'ları veritabanına eklemek için API endpoint'lerini kullanabilir veya `backend/app/ingestion/worker.py` dosyasındaki `get_tracked_tokens` fonksiyonunu güncelleyebilirsiniz.

### 6. Uygulamayı Açın

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Geliştirme Modu

### Backend Geliştirme

Backend kodunu değiştirdiğinizde, Docker container otomatik olarak yeniden yüklenir (hot reload).

Manuel olarak backend'i yeniden başlatmak için:

```bash
docker-compose restart backend
```

Backend loglarını görmek için:

```bash
docker-compose logs -f backend
```

### Frontend Geliştirme

Frontend kodunu değiştirdiğinizde, Next.js otomatik olarak yeniden yüklenir.

Frontend loglarını görmek için:

```bash
docker-compose logs -f frontend
```

### Veritabanı İşlemleri

Veritabanına bağlanmak için:

```bash
docker-compose exec db psql -U superchain -d superchain_explorer
```

Yeni migration oluşturmak için:

```bash
docker-compose exec backend alembic revision --autogenerate -m "migration_description"
```

Migration'ı uygulamak için:

```bash
docker-compose exec backend alembic upgrade head
```

## Production Deployment

### Backend Deployment

Backend'i bir VM veya container servisine deploy edebilirsiniz:

1. `backend/Dockerfile` production build için optimize edilmiştir
2. Environment değişkenlerini production değerleriyle ayarlayın
3. PostgreSQL için managed database (Supabase, RDS, vb.) kullanın

### Frontend Deployment

Frontend Vercel'e deploy edilebilir:

```bash
vercel --prod
```

Veya herhangi bir Node.js hosting servisine deploy edebilirsiniz.

### Data Ingestion Worker

Production'da worker'ı cron job olarak çalıştırın:

```bash
# Her 15 dakikada bir çalıştır
*/15 * * * * docker-compose exec -T backend python -m app.ingestion.worker --once
```

Veya worker'ı sürekli çalışan bir servis olarak başlatın:

```bash
docker-compose exec -d backend python -m app.ingestion.worker --interval 900
```

## API Endpoints

### Health Check
```
GET /health
```

### Chains
```
GET /api/chains
```

### Tokens
```
GET /api/tokens?chain=base&search=USDC&sort=volume_24h&limit=20&offset=0
GET /api/tokens/trending?limit=20
GET /api/tokens/{token_id}
GET /api/tokens/{token_id}/price-history?range=24h
```

Detaylı API dokümantasyonu için: http://localhost:8000/docs

## Proje Yapısı

```
superchain-token-explorer/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routers
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   ├── ingestion/      # Data ingestion worker
│   │   └── db/             # Database configuration
│   ├── alembic/            # Database migrations
│   └── requirements.txt
├── app/                    # Next.js frontend (App Router)
│   ├── tokens/            # Token pages
│   ├── components/        # React components
│   └── providers/         # Context providers
├── lib/                    # Shared utilities
│   ├── api.ts             # API client
│   └── hooks/             # React Query hooks
├── docker-compose.yml
└── README.md
```

## Sorun Giderme

### Backend başlamıyor

1. Veritabanının hazır olduğundan emin olun:
   ```bash
   docker-compose ps db
   ```

2. Backend loglarını kontrol edin:
   ```bash
   docker-compose logs backend
   ```

### Frontend API'ye bağlanamıyor

1. `NEXT_PUBLIC_API_BASE_URL` environment variable'ının doğru olduğundan emin olun
2. Backend'in çalıştığını kontrol edin:
   ```bash
   curl http://localhost:8000/health
   ```

### Migration hataları

1. Mevcut migration'ları kontrol edin:
   ```bash
   docker-compose exec backend alembic current
   ```

2. Migration'ı sıfırdan uygulamak için (DİKKAT: Veriler silinir):
   ```bash
   docker-compose exec backend alembic downgrade base
   docker-compose exec backend alembic upgrade head
   ```

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## İletişim

- GitHub: [@serayd61](https://github.com/serayd61)
- Twitter: [@serayd61](https://twitter.com/serayd61)

---

**Superchain Token Explorer** - Optimism Superchain ekosistemi için production-grade token explorer
