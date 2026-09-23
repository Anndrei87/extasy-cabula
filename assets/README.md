# Hotel Extasy Cabula

Landing page gerada pelo Tapir LP a partir do [Guia de Motéis](https://www.guiademoteis.com.br/salvador/moteis/hotel-extasy-cabula) + fotos enviadas pelo cliente.

## Estrutura

```
hotels/extasy-cabula/
├── README.md
├── images/
│   ├── hero.jpg              # Fachada (banner)
│   ├── rooms/                # Stand, Luxo, Super Luxo
│   └── gallery/
└── _scrape/
    ├── data.json             # Dados extraídos do Guia
    └── _scrape.html
```

## Config

`configs/extasy-cabula.json`

## Contato

- Telefone / WhatsApp: (71) 3387-0373
- Endereço: Estrada das Barreiras, 516 — Cabula, Salvador/BA
- Booking: https://www.tapirbooking.com.br/extasycabula/

## Suítes

| Suíte | A partir de | Destaques |
|-------|-------------|-----------|
| Luxo | R$ 70 | Conforto e custo-benefício |
| Garagem | R$ 80 | Garagem privativa |
| VIP | R$ 110 | Categoria premium |

## Comandos

```bash
npm run dev:hotel -- extasy-cabula
npm run build -- extasy-cabula
```

Output: `dist/extasy-cabula/`
