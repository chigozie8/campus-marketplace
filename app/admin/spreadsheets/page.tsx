"use client"

import { useState } from "react"

// ─── Spreadsheet definitions ────────────────────────────────────────────────

const SPREADSHEETS = [
  {
    id: "whatsapp_messages",
    title: "WhatsApp Message Log",
    description:
      "Tracks every incoming message from customers via the WhatsApp bot.",
    tabs: [
      {
        name: "Messages",
        headers: [
          "Timestamp",
          "Phone Number",
          "Customer Name",
          "Message Text",
          "Message Type",
          "Intent Detected",
          "Bot Response",
          "Response Sent At",
          "Consent Status",
          "Session ID",
          "Status",
          "Notes",
        ],
        rows: [
          [
            "2025-01-15 09:32:11",
            "+2348012345678",
            "Adaeze Okonkwo",
            "Hi",
            "text",
            "greeting",
            "Welcome to VendoorX! Here's what I can help with...",
            "2025-01-15 09:32:12",
            "accepted",
            "sess_abc123",
            "handled",
            "",
          ],
          [
            "2025-01-15 09:33:45",
            "+2348012345678",
            "Adaeze Okonkwo",
            "I need a laptop",
            "text",
            "search",
            "Found 4 listings for laptop...",
            "2025-01-15 09:33:46",
            "accepted",
            "sess_abc123",
            "handled",
            "",
          ],
          [
            "2025-01-15 10:05:20",
            "+2347098765432",
            "Chidi Nwosu",
            "Browse",
            "text",
            "browse",
            "Here are our categories...",
            "2025-01-15 10:05:21",
            "accepted",
            "sess_def456",
            "handled",
            "",
          ],
          [
            "2025-01-15 10:22:00",
            "+2349011223344",
            "Unknown",
            "YES",
            "text",
            "tos_accept",
            "You're all set! Welcome to VendoorX.",
            "2025-01-15 10:22:01",
            "pending",
            "sess_ghi789",
            "handled",
            "First time user, accepted ToS",
          ],
          [
            "2025-01-15 11:00:00",
            "+2348099887766",
            "Ngozi Eze",
            "STOP",
            "text",
            "opt_out",
            "You've been opted out.",
            "2025-01-15 11:00:01",
            "opted_out",
            "sess_jkl012",
            "handled",
            "",
          ],
        ],
      },
    ],
  },

  {
    id: "orders",
    title: "Orders",
    description:
      "All orders placed through the WhatsApp bot and the marketplace website.",
    tabs: [
      {
        name: "Orders",
        headers: [
          "Order ID",
          "Timestamp",
          "Buyer Phone",
          "Buyer Name",
          "Buyer Email",
          "Product ID",
          "Product Title",
          "Seller Phone",
          "Seller Name",
          "Quantity",
          "Unit Price (NGN)",
          "Total Price (NGN)",
          "Delivery Address",
          "Campus",
          "Order Source",
          "Payment Method",
          "Payment Status",
          "Order Status",
          "Tracking Notes",
          "Completed At",
        ],
        rows: [
          [
            "ORD-00001",
            "2025-01-15 09:45:00",
            "+2348012345678",
            "Adaeze Okonkwo",
            "adaeze@unn.edu.ng",
            "PROD-001",
            "HP Laptop 14-inch",
            "+2348055667788",
            "Emeka Sellers",
            "1",
            "85000",
            "85000",
            "Block C, Room 204, Queens Hall",
            "University of Nigeria Nsukka",
            "whatsapp_bot",
            "bank_transfer",
            "paid",
            "delivered",
            "Delivered by seller in person",
            "2025-01-16 14:00:00",
          ],
          [
            "ORD-00002",
            "2025-01-16 11:20:00",
            "+2347098765432",
            "Chidi Nwosu",
            "chidi@unn.edu.ng",
            "PROD-015",
            "Engineering Textbook Set",
            "+2348033445566",
            "BookStore Ng",
            "2",
            "12000",
            "24000",
            "New Site, Block B Room 105",
            "University of Nigeria Nsukka",
            "website",
            "paystack",
            "paid",
            "processing",
            "Seller confirmed, awaiting pickup",
            "",
          ],
          [
            "ORD-00003",
            "2025-01-17 08:10:00",
            "+2349011223344",
            "Blessing Okoro",
            "blessing@lasu.edu.ng",
            "PROD-032",
            "Scientific Calculator",
            "+2348077889900",
            "Campus Gadgets",
            "1",
            "8500",
            "8500",
            "Female Hostel, Room 12",
            "Lagos State University",
            "whatsapp_bot",
            "cash_on_delivery",
            "pending",
            "pending",
            "",
            "",
          ],
        ],
      },
    ],
  },

  {
    id: "products",
    title: "Product Listings",
    description:
      "All products listed on VendoorX by sellers across campuses.",
    tabs: [
      {
        name: "Products",
        headers: [
          "Product ID",
          "Title",
          "Description",
          "Category",
          "Sub-Category",
          "Price (NGN)",
          "Condition",
          "Stock Quantity",
          "Seller ID",
          "Seller Name",
          "Seller Phone",
          "Seller Campus",
          "Listing Date",
          "Last Updated",
          "Status",
          "Views",
          "Saves (Favourites)",
          "Orders Count",
          "Image URL 1",
          "Image URL 2",
          "Tags",
          "Notes",
        ],
        rows: [
          [
            "PROD-001",
            "HP Laptop 14-inch",
            "HP laptop, 8GB RAM, 256GB SSD, excellent condition",
            "Electronics",
            "Laptops",
            "85000",
            "used",
            "1",
            "USR-0055",
            "Emeka Sellers",
            "+2348055667788",
            "University of Nigeria Nsukka",
            "2025-01-10",
            "2025-01-10",
            "active",
            "47",
            "12",
            "1",
            "https://...",
            "",
            "laptop, hp, computer",
            "",
          ],
          [
            "PROD-015",
            "Engineering Textbook Set",
            "Complete set of 300-level engineering textbooks",
            "Books",
            "Textbooks",
            "12000",
            "used",
            "3",
            "USR-0088",
            "BookStore Ng",
            "+2348033445566",
            "University of Nigeria Nsukka",
            "2025-01-12",
            "2025-01-14",
            "active",
            "23",
            "5",
            "2",
            "https://...",
            "https://...",
            "textbook, engineering, 300l",
            "",
          ],
          [
            "PROD-032",
            "Scientific Calculator",
            "Casio FX-991ES PLUS, barely used",
            "Electronics",
            "Calculators",
            "8500",
            "used",
            "2",
            "USR-0102",
            "Campus Gadgets",
            "+2348077889900",
            "Lagos State University",
            "2025-01-13",
            "2025-01-13",
            "active",
            "18",
            "3",
            "1",
            "https://...",
            "",
            "calculator, casio, maths",
            "",
          ],
        ],
      },
    ],
  },

  {
    id: "users",
    title: "Users & Sellers",
    description:
      "All registered users, buyers, and sellers on VendoorX.",
    tabs: [
      {
        name: "Users",
        headers: [
          "User ID",
          "Full Name",
          "Email",
          "Phone Number",
          "WhatsApp Consent",
          "Consent Date",
          "Role",
          "Campus",
          "Department",
          "Level",
          "Account Status",
          "Date Registered",
          "Last Active",
          "Total Orders",
          "Total Listings",
          "Total Sales (NGN)",
          "Seller Rating",
          "Verified Seller",
          "Notes",
        ],
        rows: [
          [
            "USR-0001",
            "Adaeze Okonkwo",
            "adaeze@unn.edu.ng",
            "+2348012345678",
            "accepted",
            "2025-01-14 08:00:00",
            "buyer",
            "University of Nigeria Nsukka",
            "Computer Science",
            "300",
            "active",
            "2025-01-14",
            "2025-01-17",
            "3",
            "0",
            "0",
            "",
            "No",
            "",
          ],
          [
            "USR-0055",
            "Emeka Sellers",
            "emeka@unn.edu.ng",
            "+2348055667788",
            "accepted",
            "2024-12-01 10:00:00",
            "seller",
            "University of Nigeria Nsukka",
            "Engineering",
            "400",
            "active",
            "2024-12-01",
            "2025-01-16",
            "1",
            "5",
            "85000",
            "4.8",
            "Yes",
            "Top seller",
          ],
          [
            "USR-0088",
            "BookStore Ng",
            "bookstore@unn.edu.ng",
            "+2348033445566",
            "accepted",
            "2024-11-20 09:00:00",
            "seller",
            "University of Nigeria Nsukka",
            "N/A",
            "N/A",
            "active",
            "2024-11-20",
            "2025-01-17",
            "0",
            "12",
            "156000",
            "4.5",
            "Yes",
            "Campus bookstore account",
          ],
          [
            "USR-0102",
            "Blessing Okoro",
            "blessing@lasu.edu.ng",
            "+2349011223344",
            "pending",
            "",
            "buyer_seller",
            "Lagos State University",
            "Accounting",
            "200",
            "active",
            "2025-01-15",
            "2025-01-17",
            "1",
            "2",
            "17000",
            "",
            "No",
            "",
          ],
        ],
      },
    ],
  },

  {
    id: "n8n_workflow",
    title: "n8n Workflow Log",
    description:
      "Tracks every automation execution triggered by the WhatsApp bot through n8n.",
    tabs: [
      {
        name: "Executions",
        headers: [
          "Execution ID",
          "Timestamp",
          "Workflow Name",
          "Trigger",
          "Phone Number",
          "Input Data",
          "Node Executed",
          "Node Status",
          "Output Data",
          "Error Message",
          "Duration (ms)",
          "Status",
        ],
        rows: [
          [
            "EXEC-0001",
            "2025-01-15 09:32:11",
            "WhatsApp Bot Main",
            "webhook",
            "+2348012345678",
            '{"message":"Hi","type":"text"}',
            "Send WhatsApp Message",
            "success",
            '{"messageId":"msg_xxx"}',
            "",
            "320",
            "success",
          ],
          [
            "EXEC-0002",
            "2025-01-15 09:45:00",
            "Order Notification",
            "order_placed",
            "+2348012345678",
            '{"orderId":"ORD-00001"}',
            "Log to Google Sheets",
            "success",
            '{"row":2}',
            "",
            "540",
            "success",
          ],
          [
            "EXEC-0003",
            "2025-01-16 11:20:00",
            "WhatsApp Bot Main",
            "webhook",
            "+2347098765432",
            '{"message":"Browse","type":"text"}',
            "Fetch Categories",
            "error",
            "",
            "Supabase timeout after 5000ms",
            "5200",
            "failed",
          ],
          [
            "EXEC-0004",
            "2025-01-17 08:10:00",
            "New Order Alert",
            "order_placed",
            "+2349011223344",
            '{"orderId":"ORD-00003"}',
            "Notify Seller via WhatsApp",
            "success",
            '{"messageId":"msg_yyy"}',
            "",
            "410",
            "success",
          ],
        ],
      },
    ],
  },
]

// ─── CSV helper ─────────────────────────────────────────────────────────────

function toCSV(headers: string[], rows: string[][]): string {
  const escape = (val: string) =>
    val.includes(",") || val.includes('"') || val.includes("\n")
      ? `"${val.replace(/"/g, '""')}"`
      : val

  const lines = [
    headers.map(escape).join(","),
    ...rows.map((row) => row.map(escape).join(",")),
  ]
  return lines.join("\n")
}

function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function downloadAllAsZip(sheets: typeof SPREADSHEETS) {
  // Download each sheet individually since we can't create zip without a library
  sheets.forEach((sheet) => {
    sheet.tabs.forEach((tab) => {
      const csv = toCSV(tab.headers, tab.rows)
      downloadCSV(`vendoorx_${sheet.id}_${tab.name.toLowerCase().replace(/\s+/g, "_")}.csv`, csv)
    })
  })
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SpreadsheetsPage() {
  const [activeSheet, setActiveSheet] = useState(SPREADSHEETS[0].id)

  const current = SPREADSHEETS.find((s) => s.id === activeSheet)!

  return (
    <main className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              VendoorX Spreadsheet Templates
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Download these as CSV files and import directly into Google Sheets
            </p>
          </div>
          <button
            onClick={() => downloadAllAsZip(SPREADSHEETS)}
            className="mt-3 sm:mt-0 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <DownloadIcon className="size-4" />
            Download All CSVs
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <nav className="flex flex-col gap-1">
            {SPREADSHEETS.map((sheet) => (
              <button
                key={sheet.id}
                onClick={() => setActiveSheet(sheet.id)}
                className={`flex flex-col gap-0.5 rounded-lg px-4 py-3 text-left transition-colors ${
                  activeSheet === sheet.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <span className="text-sm font-medium leading-tight">
                  {sheet.title}
                </span>
                <span
                  className={`text-xs leading-snug ${
                    activeSheet === sheet.id
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {sheet.tabs[0].headers.length} columns &middot;{" "}
                  {sheet.tabs[0].rows.length} sample rows
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <section className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Sheet header */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">{current.title}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {current.description}
              </p>
            </div>
            <div className="flex gap-2 mt-3 sm:mt-0 shrink-0">
              {current.tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => {
                    const csv = toCSV(tab.headers, tab.rows)
                    downloadCSV(
                      `vendoorx_${current.id}_${tab.name.toLowerCase().replace(/\s+/g, "_")}.csv`,
                      csv
                    )
                  }}
                  className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
                >
                  <DownloadIcon className="size-3.5" />
                  Download {tab.name} CSV
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {current.tabs.map((tab) => (
            <div key={tab.name} className="flex flex-col gap-2">
              <div className="rounded-lg border border-border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      {tab.headers.map((h, i) => (
                        <th
                          key={i}
                          className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground tracking-wide border-b border-border"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tab.rows.map((row, ri) => (
                      <tr
                        key={ri}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className="whitespace-nowrap px-3 py-2 text-xs text-foreground max-w-[200px] overflow-hidden text-ellipsis"
                            title={cell}
                          >
                            {cell === "" ? (
                              <span className="text-muted-foreground/50">—</span>
                            ) : (
                              cell
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Instructions */}
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 flex flex-col gap-1.5">
                <p className="text-xs font-semibold text-foreground">
                  How to import into Google Sheets
                </p>
                <ol className="text-xs text-muted-foreground list-decimal list-inside flex flex-col gap-1 leading-relaxed">
                  <li>Download the CSV using the button above</li>
                  <li>
                    Open{" "}
                    <a
                      href="https://sheets.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2"
                    >
                      sheets.google.com
                    </a>{" "}
                    and create a new blank spreadsheet
                  </li>
                  <li>
                    Go to <strong>File</strong> &rarr;{" "}
                    <strong>Import</strong> &rarr; <strong>Upload</strong>
                  </li>
                  <li>Select the downloaded CSV file</li>
                  <li>
                    Choose <strong>Replace spreadsheet</strong> and click{" "}
                    <strong>Import data</strong>
                  </li>
                  <li>
                    In n8n, use the <strong>Google Sheets &rarr; Append Row</strong>{" "}
                    node to log new data automatically
                  </li>
                </ol>
              </div>
            </div>
          ))}

          {/* Column reference */}
          <details className="rounded-lg border border-border overflow-hidden">
            <summary className="flex items-center justify-between px-4 py-3 cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors text-sm font-medium select-none">
              Column reference &amp; n8n field mappings
              <ChevronIcon />
            </summary>
            <div className="px-4 py-3 border-t border-border overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-semibold text-muted-foreground">
                      Column
                    </th>
                    <th className="text-left py-2 pr-4 font-semibold text-muted-foreground">
                      n8n Expression
                    </th>
                    <th className="text-left py-2 font-semibold text-muted-foreground">
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {current.tabs[0].headers.map((h, i) => (
                    <tr key={i}>
                      <td className="py-1.5 pr-4 font-medium text-foreground">
                        {h}
                      </td>
                      <td className="py-1.5 pr-4 text-muted-foreground font-mono">
                        {getNn8nExpr(current.id, h)}
                      </td>
                      <td className="py-1.5 text-muted-foreground">
                        {getSource(current.id, h)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </section>
      </div>
    </main>
  )
}

// ─── n8n expression helpers ──────────────────────────────────────────────────

function getNn8nExpr(sheetId: string, col: string): string {
  const map: Record<string, Record<string, string>> = {
    whatsapp_messages: {
      Timestamp: "{{$now.toISO()}}",
      "Phone Number": "{{$json.body.entry[0].changes[0].value.messages[0].from}}",
      "Customer Name": "{{$json.body.entry[0].changes[0].value.contacts[0].profile.name}}",
      "Message Text": "{{$json.body.entry[0].changes[0].value.messages[0].text.body}}",
      "Message Type": "{{$json.body.entry[0].changes[0].value.messages[0].type}}",
      "Intent Detected": "{{$json.intent}}",
      "Bot Response": "{{$json.botReply}}",
      "Response Sent At": "{{$now.toISO()}}",
      "Consent Status": "{{$json.consentStatus}}",
      "Session ID": "{{$json.sessionId}}",
      Status: '"handled"',
      Notes: '""',
    },
    orders: {
      "Order ID": "{{$json.id}}",
      Timestamp: "{{$json.created_at}}",
      "Buyer Phone": "{{$json.buyer_phone}}",
      "Buyer Name": "{{$json.buyer_name}}",
      "Buyer Email": "{{$json.buyer_email}}",
      "Product ID": "{{$json.product_id}}",
      "Product Title": "{{$json.product_title}}",
      "Seller Phone": "{{$json.seller_phone}}",
      "Seller Name": "{{$json.seller_name}}",
      Quantity: "{{$json.quantity}}",
      "Unit Price (NGN)": "{{$json.unit_price}}",
      "Total Price (NGN)": "{{$json.total_price}}",
      "Delivery Address": "{{$json.delivery_address}}",
      Campus: "{{$json.campus}}",
      "Order Source": "{{$json.source}}",
      "Payment Method": "{{$json.payment_method}}",
      "Payment Status": "{{$json.payment_status}}",
      "Order Status": "{{$json.status}}",
      "Tracking Notes": '""',
      "Completed At": '""',
    },
    users: {
      "User ID": "{{$json.id}}",
      "Full Name": "{{$json.full_name}}",
      Email: "{{$json.email}}",
      "Phone Number": "{{$json.phone}}",
      "WhatsApp Consent": "{{$json.whatsapp_consent}}",
      "Consent Date": "{{$json.consent_date}}",
      Role: "{{$json.role}}",
      Campus: "{{$json.campus}}",
      Department: "{{$json.department}}",
      Level: "{{$json.level}}",
      "Account Status": "{{$json.status}}",
      "Date Registered": "{{$json.created_at}}",
      "Last Active": "{{$json.last_active}}",
      "Total Orders": "{{$json.total_orders}}",
      "Total Listings": "{{$json.total_listings}}",
      "Total Sales (NGN)": "{{$json.total_sales}}",
      "Seller Rating": "{{$json.seller_rating}}",
      "Verified Seller": "{{$json.is_verified_seller}}",
      Notes: '""',
    },
  }
  return map[sheetId]?.[col] ?? `{{$json.${col.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")}}}`
}

function getSource(sheetId: string, col: string): string {
  const map: Record<string, string> = {
    Timestamp: "Automatic (n8n)",
    "Phone Number": "WasenderAPI webhook",
    "Customer Name": "WasenderAPI webhook",
    "Message Text": "WasenderAPI webhook",
    "Message Type": "WasenderAPI webhook",
    "Intent Detected": "Bot handler logic",
    "Bot Response": "Bot handler logic",
    "Response Sent At": "Automatic (n8n)",
    "Consent Status": "Redis / Supabase",
    "Session ID": "Redis session",
    Status: "Static value",
    Notes: "Manual entry",
    "Order ID": "Supabase orders table",
    "Buyer Phone": "Supabase / WhatsApp",
    "Seller Phone": "Supabase profiles",
    "Payment Status": "Paystack webhook",
    "Order Status": "Supabase orders table",
    "User ID": "Supabase auth.users",
    "WhatsApp Consent": "Redis consent store",
    "Consent Date": "Redis consent store",
    "Verified Seller": "Supabase profiles",
    "Execution ID": "n8n execution ID",
    "Workflow Name": "n8n workflow name",
    Trigger: "n8n trigger node",
    "Node Executed": "n8n active node",
    "Node Status": "n8n node result",
    "Error Message": "n8n error output",
    "Duration (ms)": "n8n execution time",
  }
  return map[col] ?? "Supabase / n8n"
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 text-muted-foreground"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
