// Entidades de domínio — mantidas independentes de qualquer backend.
// Para migrar para Firebase: traduza esses tipos em coleções Firestore.

export type ID = string;

export type Unit = "un" | "m" | "kg" | "rolo" | "pct" | "par";

export interface Component {
  id: ID;
  name: string;
  category: string;          // ex: "Balão", "Painel", "Mesa", "Decor"
  unit: Unit;
  stock: number;             // quantidade atual em estoque
  minStock: number;          // alerta de estoque baixo
  unitCost: number;          // custo médio por unidade
  reusable: boolean;         // material reutilizável (locação) vs consumível
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface KitItem {
  componentId: ID;
  quantity: number;          // qtd usada do componente no kit
}

export interface Kit {
  id: ID;
  name: string;              // ex: "Kit Mickey Premium"
  theme: string;             // ex: "Mickey", "Batman", "Personalizado"
  type: "decoracao" | "pegue_monte" | "locacao";
  description?: string;
  price: number;             // preço de venda/locação
  items: KitItem[];          // BOM — componentes que compõem o kit
  imageColor?: string;       // cor decorativa do card (hex)
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export type SaleStatus = "agendado" | "confirmado" | "entregue" | "concluido" | "cancelado";

export interface Sale {
  id: ID;
  customerName: string;
  customerPhone?: string;
  kitId: ID;
  kitNameSnapshot: string;   // snapshot p/ histórico mesmo se o kit mudar
  eventDate: number;         // data do evento
  totalPrice: number;
  paidAmount: number;
  status: SaleStatus;
  notes?: string;
  source: "manual" | "whatsapp" | "automacao";
  createdAt: number;
}

export type CostKind = "pessoal" | "profissional";
export type CostFrequency = "unico" | "mensal" | "anual";

export interface CostEntry {
  id: ID;
  description: string;
  kind: CostKind;
  category: string;          // ex: "Aluguel", "Marketing", "Mercado"
  amount: number;
  frequency: CostFrequency;
  date: number;
  createdAt: number;
}

export interface Profile {
  id: ID;
  businessName: string;
  ownerName: string;
  phone?: string;
  email?: string;
  themes: string[];          // temas com os quais a decoradora trabalha
  workTypes: Array<"decoracao" | "pegue_monte" | "locacao">;
  onboardingCompleted: boolean;
  createdAt: number;
}

export interface Settings {
  notifyLowStock: boolean;
  notifyWeeklyReport: boolean;
  weeklyReportEmail?: string;
  currency: "BRL";
  lowStockMultiplier: number; // alerta quando stock <= minStock * multiplier
}

export interface DbSchema {
  profile: Profile | null;
  settings: Settings;
  components: Component[];
  kits: Kit[];
  sales: Sale[];
  costs: CostEntry[];
}
