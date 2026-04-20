import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useActivityContext } from "../../context/ActivityContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Button,
  useTheme,
  useMediaQuery,
  Chip,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  InputAdornment,
  Badge,
  Tooltip,
  Divider,
  Switch,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from "@mui/material";
import {
  Business as BusinessIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Menu as MenuIcon,
  Check as CheckIcon,
  FilterList as FilterListIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Star as StarIcon,
  Category as CategoryIcon,
  Receipt as ReceiptIcon,
  AttachMoney as AttachMoneyIcon,
  LocalShipping as LocalShippingIcon,
  Assignment as AssignmentIcon,
  Verified as VerifiedIcon,
  Build as BuildIcon,
  People as PeopleIcon,
  Factory as FactoryIcon,
  Comment as CommentIcon,
  CalendarToday as CalendarTodayIcon,
  Percent as PercentIcon,
  Public as PublicIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { CiFilter } from "react-icons/ci";
import SharedSidebar from "../../components/SharedSidebar";

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const C = {
  bg: "black",
  surface: "#0d1321",
  surfaceHi: "#111827",
  border: "#1e2d42",
  borderHi: "#2d4a6e",
  accent: "#3b82f6",
  accentDim: "rgba(59,130,246,0.12)",
  accentHi: "#60a5fa",
  success: "#10b981",
  successDim: "rgba(16,185,129,0.12)",
  danger: "#ef4444",
  dangerDim: "rgba(239,68,68,0.12)",
  warning: "#f59e0b",
  warningDim: "rgba(245,158,11,0.12)",
  info: "#8b5cf6",
  infoDim: "rgba(139,92,246,0.12)",
  text: "#f1f5f9",
  textMuted: "#64748b",
  textSub: "#94a3b8",
};

const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/* ─── StatCard ─────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, color, onClick }) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        bgcolor: hexToRgba(color, 0.1),
        border: `1px solid ${hexToRgba(color, 0.2)}`,
        borderRadius: 3,
        transition: "all 0.3s ease",
        cursor: onClick ? "pointer" : "default",
        minHeight: 110,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 8px 24px ${hexToRgba(color, 0.2)}`,
        },
      }}
    >
      <CardContent sx={{ py: 2, px: 2.5, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <Typography variant="body2" sx={{ color: "#94a3b8", mb: 0.5, fontSize: "0.85rem" }}>
          {label}
        </Typography>
        <Typography variant="h5" sx={{ color: "white", fontWeight: 700 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

/* ─── Supplier Card Component (Version complète) ─────────────────────────── */
const SupplierCard = ({ supplier, onEdit, onDelete, onToggleStatus }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getNoteColor = (note) => {
    if (note >= 4) return C.success;
    if (note >= 3) return C.warning;
    return C.danger;
  };

  const getSecteurLabel = (secteur) => {
    const options = {
      matiere_premiere: "Matière Première",
      matiere_consommable: "Matière Consommable",
      matiere_emballage: "Matière Emballage",
      matiere_chimique: "Matière Chimique",
      matiere_dangereuse: "Matière Dangereuse",
      fourniture_bureau: "Fournitures Bureau",
    };
    return options[secteur] || secteur || "-";
  };

  const getSecteurColor = (secteur) => {
    const colors = {
      matiere_premiere: C.accent,
      matiere_consommable: C.success,
      matiere_emballage: C.warning,
      matiere_chimique: C.info,
      matiere_dangereuse: C.danger,
      fourniture_bureau: "#38bdf8",
    };
    return colors[secteur] || C.textMuted;
  };

  const InfoRow = ({ icon: Icon, label, value, color }) => (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.5 }}>
      <Avatar sx={{ width: 28, height: 28, bgcolor: hexToRgba(color || C.accent, 0.1), flexShrink: 0 }}>
        <Icon sx={{ fontSize: 14, color: color || C.accent }} />
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ color: C.textMuted, fontSize: "0.65rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </Typography>
        <Typography sx={{ color: C.textSub, fontSize: "0.8rem", wordBreak: "break-word" }}>
          {value || "-"}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Card sx={{
      bgcolor: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: "16px",
      transition: "all 0.2s ease",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      "&:hover": {
        transform: "translateY(-4px)",
        borderColor: C.accent,
        boxShadow: `0 8px 24px ${hexToRgba(C.accent, 0.15)}`,
      },
    }}>
      <CardContent sx={{ p: 3, flex: 1 }}>
        {/* Header avec avatar et menu */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: hexToRgba(C.accent, 0.15), width: 56, height: 56 }}>
              <BusinessIcon sx={{ fontSize: 28, color: C.accent }} />
            </Avatar>
            <Box>
              <Typography sx={{ color: C.text, fontWeight: 700, fontSize: "1.1rem" }}>
                {supplier.name}
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5, mt: 0.5, flexWrap: "wrap" }}>
                <Chip
                  label={getSecteurLabel(supplier.secteur)}
                  size="small"
                  sx={{
                    bgcolor: hexToRgba(getSecteurColor(supplier.secteur), 0.15),
                    color: getSecteurColor(supplier.secteur),
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    height: 22,
                  }}
                />
                <Chip
                  icon={<StarIcon sx={{ fontSize: 12 }} />}
                  label={`${supplier.note_globale || 3}/5`}
                  size="small"
                  sx={{
                    bgcolor: hexToRgba(getNoteColor(supplier.note_globale || 3), 0.15),
                    color: getNoteColor(supplier.note_globale || 3),
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    height: 22,
                  }}
                />
                <Chip
                  label={supplier.is_active ? "Actif" : "Inactif"}
                  size="small"
                  sx={{
                    bgcolor: supplier.is_active ? C.successDim : C.dangerDim,
                    color: supplier.is_active ? C.success : C.danger,
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    height: 22,
                  }}
                />
              </Box>
            </Box>
          </Box>
          <IconButton size="small" onClick={handleMenuOpen} sx={{ color: C.textMuted, "&:hover": { color: C.accent } }}>
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: C.border, my: 2 }} />

        {/* Section: Informations légales */}
        <Typography sx={{ color: C.accent, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", mb: 1.5, letterSpacing: "0.08em" }}>
          <BusinessIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }} />
          INFORMATIONS LÉGALES
        </Typography>
        <InfoRow icon={ReceiptIcon} label="Registre commercial" value={supplier.registre_commerce} color={C.accent} />
        <InfoRow icon={AssignmentIcon} label="Identifiant fiscal" value={supplier.identifiant_fiscal} color={C.accent} />
        <InfoRow icon={CalendarTodayIcon} label="Ancienneté" value={supplier.anciennete} color={C.accent} />

        <Divider sx={{ borderColor: C.border, my: 1.5 }} />

        {/* Section: Contact */}
        <Typography sx={{ color: C.accent, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", mb: 1.5, letterSpacing: "0.08em" }}>
          <PeopleIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }} />
          CONTACT
        </Typography>
        <InfoRow icon={PersonIcon} label="Contact principal" value={supplier.contact_name} color={C.success} />
        <InfoRow icon={EmailIcon} label="Email" value={supplier.email} color={C.success} />
        <InfoRow icon={PhoneIcon} label="Téléphone" value={supplier.phone} color={C.success} />

        <Divider sx={{ borderColor: C.border, my: 1.5 }} />

        {/* Section: Localisation */}
        <Typography sx={{ color: C.accent, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", mb: 1.5, letterSpacing: "0.08em" }}>
          <LocationOnIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }} />
          LOCALISATION
        </Typography>
        <InfoRow icon={LocationOnIcon} label="Adresse" value={supplier.address} color={C.info} />
        <InfoRow icon={LocationOnIcon} label="Ville" value={supplier.city} color={C.info} />
        <InfoRow icon={PublicIcon} label="Pays" value={supplier.country} color={C.info} />

        {/* Section déroulante pour les infos commerciales */}
        <Box 
          onClick={() => setExpanded(!expanded)} 
          sx={{ 
            cursor: "pointer", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            mt: 2,
            mb: 1,
            p: 1,
            bgcolor: hexToRgba(C.accent, 0.05),
            borderRadius: "8px",
            "&:hover": { bgcolor: hexToRgba(C.accent, 0.1) }
          }}
        >
          <Typography sx={{ color: C.accent, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <AttachMoneyIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }} />
            OFFRE COMMERCIALE
          </Typography>
          <Typography sx={{ color: C.textMuted, fontSize: "0.7rem" }}>
            {expanded ? "▼" : "▶"}
          </Typography>
        </Box>

        {expanded && (
          <Box sx={{ mt: 1 }}>
            <InfoRow icon={AttachMoneyIcon} label="Prix unitaire" value={supplier.prix_unitaire} color={C.warning} />
            <InfoRow icon={ReceiptIcon} label="Conditions de paiement" value={supplier.conditions_paiement} color={C.warning} />
            <InfoRow icon={PercentIcon} label="Remise / Réduction" value={supplier.remise} color={C.warning} />
            <InfoRow icon={PublicIcon} label="Zone de couverture" value={supplier.zone_couverture} color={C.warning} />
            <InfoRow icon={ShoppingCartIcon} label="Minimum de commande" value={supplier.minimum_commande} color={C.warning} />
            <InfoRow icon={LocalShippingIcon} label="Délai de livraison" value={supplier.delai_livraison} color={C.warning} />
            <InfoRow icon={VerifiedIcon} label="Certifications" value={supplier.certifications} color={C.warning} />
            <InfoRow icon={BuildIcon} label="Garantie / SAV" value={supplier.garantie_sav} color={C.warning} />
            <InfoRow icon={PeopleIcon} label="Références clients" value={supplier.references_clients} color={C.warning} />
            <InfoRow icon={FactoryIcon} label="Capacité de production" value={supplier.capacite_production} color={C.warning} />
          </Box>
        )}

        {/* Commentaires */}
        {supplier.commentaires && (
          <>
            <Divider sx={{ borderColor: C.border, my: 1.5 }} />
            <InfoRow icon={CommentIcon} label="Commentaires" value={supplier.commentaires} color={C.info} />
          </>
        )}

        {/* Switch statut */}
        <Divider sx={{ borderColor: C.border, my: 1.5 }} />
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
          <Typography sx={{ color: C.textMuted, fontSize: "0.75rem" }}>Statut du fournisseur</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Switch
              checked={supplier.is_active}
              onChange={() => onToggleStatus(supplier)}
              size="small"
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: C.success },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: C.success },
              }}
            />
            <Typography variant="caption" sx={{ color: supplier.is_active ? C.success : C.danger, fontWeight: 600 }}>
              {supplier.is_active ? "Actif" : "Inactif"}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      {/* Menu Actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            bgcolor: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          },
        }}
      >
        <MenuItem onClick={() => { onEdit(supplier); handleMenuClose(); }} sx={{ color: C.accent, gap: 1 }}>
          <EditIcon fontSize="small" /> Modifier
        </MenuItem>
        <MenuItem onClick={() => { onDelete(supplier.id); handleMenuClose(); }} sx={{ color: C.danger, gap: 1 }}>
          <DeleteIcon fontSize="small" /> Supprimer
        </MenuItem>
      </Menu>
    </Card>
  );
};

const Fournisseur = () => {
  const { user } = useAuth();
  const { triggerActivityRefresh } = useActivityContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { familyKey } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [filterSecteur, setFilterSecteur] = useState("");
  
  useEffect(() => {
    if (familyKey && familyKey !== filterSecteur) {
      setFilterSecteur(familyKey);
    }
  }, [familyKey]);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); 
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    registre_commerce: "",
    identifiant_fiscal: "",
    secteur: "",
    anciennete: "",
    email: "",
    phone: "",
    contact_name: "",
    address: "",
    city: "",
    country: "",
    prix_unitaire: "",
    conditions_paiement: "",
    remise: "",
    zone_couverture: "",
    minimum_commande: "",
    delai_livraison: "",
    certifications: "",
    garantie_sav: "",
    references_clients: "",
    capacite_production: "",
    is_active: true,
    note_globale: 3,
    commentaires: "",
  });

  const [suppliers, setSuppliers] = useState([]);

  const API_BASE = "http://localhost:8000/api/fournisseurs/";

  const mapFromApi = (item) => ({
    id: item.id,
    name: item.name || "",
    registre_commerce: item.registre_commerce || "",
    identifiant_fiscal: item.identifiant_fiscal || "",
    secteur: item.secteur || "",
    anciennete: item.anciennete || "",
    email: item.email || "",
    phone: item.phone || "",
    contact_name: item.contact_name || "",
    address: item.address || "",
    city: item.city || "",
    country: item.country || "",
    prix_unitaire: item.prix_unitaire || "",
    conditions_paiement: item.conditions_paiement || "",
    remise: item.remise || "",
    zone_couverture: item.zone_couverture || "",
    minimum_commande: item.minimum_commande || "",
    delai_livraison: item.delai_livraison || "",
    certifications: item.certifications || "",
    garantie_sav: item.garantie_sav || "",
    references_clients: item.references_clients || "",
    capacite_production: item.capacite_production || "",
    is_active: Boolean(item.is_active),
    note_globale: item.note_globale || 3,
    commentaires: item.commentaires || "",
    created_at: item.created_at || null,
    updated_at: item.updated_at || null,
  });

  const mapToApi = (item) => ({
    name: item.name,
    registre_commerce: item.registre_commerce,
    identifiant_fiscal: item.identifiant_fiscal,
    secteur: item.secteur,
    anciennete: item.anciennete,
    email: item.email,
    phone: item.phone,
    contact_name: item.contact_name,
    address: item.address,
    city: item.city,
    country: item.country,
    prix_unitaire: item.prix_unitaire,
    conditions_paiement: item.conditions_paiement,
    remise: parseFloat(item.remise?.replace('%', '')) || 0,
    zone_couverture: item.zone_couverture,
    minimum_commande: item.minimum_commande,
    delai_livraison: item.delai_livraison,
    certifications: item.certifications,
    garantie_sav: item.garantie_sav,
    references_clients: item.references_clients,
    capacite_production: item.capacite_production,
    delivery_time: 0,
    vat: 0,
    payment_method: '',
    is_active: item.is_active,
    note_globale: parseInt(item.note_globale) || 3,
    commentaires: item.commentaires,
  });

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const response = await fetch(API_BASE, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        setErrorMessage(errorText || "Erreur lors du chargement des fournisseurs");
        return;
      }

      const data = await response.json();
      const items = Array.isArray(data) ? data : (data.results || []);
      setSuppliers(items.map(mapFromApi));
    } catch (error) {
      setErrorMessage("Erreur reseau lors du chargement des fournisseurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (location.pathname === "/fournisseur/new") {
      handleOpenAddDialog();
    }
  }, [location.pathname]);

  const emptyForm = {
    id: null,
    name: "",
    registre_commerce: "",
    identifiant_fiscal: "",
    secteur: "",
    anciennete: "",
    email: "",
    phone: "",
    contact_name: "",
    address: "",
    city: "",
    country: "",
    prix_unitaire: "",
    conditions_paiement: "",
    remise: "",
    zone_couverture: "",
    minimum_commande: "",
    delai_livraison: "",
    certifications: "",
    garantie_sav: "",
    references_clients: "",
    capacite_production: "",
    is_active: true,
    note_globale: 3,
    commentaires: "",
  };

  const handleOpenAddDialog = (supplier = null) => {
    const secteurPrefill = filterSecteur || '';
    setFormData(supplier ? { ...supplier } : { ...emptyForm, secteur: secteurPrefill });
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setFormData(emptyForm);
    if (location.pathname === "/fournisseur/new") {
      navigate("/fournisseur");
    }
  };

  const handleSaveSupplier = async () => {
    if (!formData.name) {
      setErrorMessage("Le nom du fournisseur est requis");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const isUpdate = Boolean(formData.id);
      const response = await fetch(isUpdate ? `${API_BASE}${formData.id}/` : API_BASE, {
        method: isUpdate ? "PUT" : "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mapToApi(formData)),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setErrorMessage(errorText || "Erreur lors de l'enregistrement du fournisseur");
        return;
      }

      const saved = mapFromApi(await response.json());
      if (isUpdate) {
        setSuppliers(suppliers.map((s) => (s.id === saved.id ? saved : s)));
        setSuccessMessage("Fournisseur mis a jour avec succes");
      } else {
        setSuppliers([saved, ...suppliers]);
        setSuccessMessage("Fournisseur ajoute avec succes");
        triggerActivityRefresh();
      }
      handleCloseAddDialog();
    } catch (error) {
      setErrorMessage("Erreur reseau lors de l'enregistrement du fournisseur");
    }
  };

  const handleDeleteSupplier = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE}${id}/`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });

      if (!response.ok) {
        const errorText = await response.text();
        setErrorMessage(errorText || "Erreur lors de la suppression du fournisseur");
        return;
      }

      setSuppliers(suppliers.filter((s) => s.id !== id));
      setSuccessMessage("Fournisseur supprime avec succes");
    } catch (error) {
      setErrorMessage("Erreur reseau lors de la suppression du fournisseur");
    }
  };

  const handleToggleStatus = async (supplier) => {
    const newStatus = !Boolean(supplier.is_active);
    
    try {
      setSuppliers(prev => prev.map(s => 
        s.id === supplier.id ? { ...s, is_active: newStatus } : s
      ));

      const token = localStorage.getItem('access_token');
      const payload = mapToApi({ ...supplier, is_active: newStatus });
      
      const res = await fetch(`${API_BASE}${supplier.id}/`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setSuppliers(prev => prev.map(s => 
          s.id === supplier.id ? { ...s, is_active: Boolean(supplier.is_active) } : s
        ));
        throw new Error('Erreur lors de la modification du statut');
      }

      setSuccessMessage(`Fournisseur ${newStatus ? 'activé' : 'désactivé'} avec succès`);
    } catch (err) {
      setErrorMessage(`Erreur: ${err.message}`);
    }
  };

  const filteredSuppliers = suppliers.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || (
      s.name.toLowerCase().includes(q) ||
      s.contact_name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q) ||
      s.country?.toLowerCase().includes(q) ||
      s.secteur?.toLowerCase().includes(q) ||
      s.registre_commerce?.toLowerCase().includes(q) ||
      s.identifiant_fiscal?.toLowerCase().includes(q)
    );
    
    const matchesStatus = 
      filterStatus === "all" ||
      (filterStatus === "active" && s.is_active) ||
      (filterStatus === "inactive" && !s.is_active);
    
    const matchesSecteur = !filterSecteur || s.secteur === filterSecteur;
    
    return matchesSearch && matchesStatus && matchesSecteur;
  });

  const stats = {
    totalSuppliers: suppliers.length,
    activeSuppliers: suppliers.filter((s) => s.is_active).length,
    inactiveSuppliers: suppliers.filter((s) => !s.is_active).length,
  };



  const statusOptions = [
    { value: "all", label: "Tous les statuts" },
    { value: "active", label: "Actifs" },
    { value: "inactive", label: "Inactifs" },
  ];

  const secteurOptions = [
    { value: "matiere_premiere", label: "Matière Première" },
    { value: "matiere_consommable", label: "Matière Consommable" },
    { value: "matiere_emballage", label: "Matière Emballage" },
    { value: "matiere_chimique", label: "Matière Chimique" },
    { value: "matiere_dangereuse", label: "Matière Dangereuse" },
    { value: "fourniture_bureau", label: "Fournitures Bureau" },
  ];
  
  const conditionsPaiementOptions = [
    "30 jours",
    "60 jours",
    "90 jours",
    "À la commande",
    "À la livraison",
    "Virement immédiat",
    "Crédit documentaire"
  ];

  const activeFiltersCount = (filterStatus !== "all" ? 1 : 0) + (filterSecteur ? 1 : 0);

  const menuItemSx = (active) => ({
    px: 2, py: 0.8,
    color: active ? C.accent : C.textSub,
    bgcolor: active ? C.accentDim : "transparent",
    fontSize: "0.875rem", display: "flex", justifyContent: "space-between", alignItems: "center",
    "&:hover": { bgcolor: "rgba(59,130,246,0.08)", color: "white" },
  });

  const largeInputSx = {
    "& .MuiOutlinedInput-root": {
      color: "#94a3b8",
      minHeight: "56px",
      height: "56px",
      "& fieldset": { borderColor: "rgba(59,130,246,0.2)" },
      "&:hover fieldset": { borderColor: "rgba(59,130,246,0.4)" },
      "&.Mui-focused fieldset": { borderColor: C.accent },
      bgcolor: "rgba(59,130,246,0.05)",
      borderRadius: "10px",
    },
    "& .MuiInputLabel-root": { color: "#64748b", fontSize: "0.9rem" },
    "& .MuiInputLabel-root.Mui-focused": { color: C.accent },
    "& .MuiSelect-select": { 
      py: "16px",
      px: "14px",
      minHeight: "56px",
      display: "flex",
      alignItems: "center",
    },
    "& .MuiInputBase-root": {
      height: "56px",
    },
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
       bgcolor: "black",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <SharedSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(!mobileOpen)}
        selectedMenu="fournisseurs"
      />

      <Box
        component="main"
        sx={{ flexGrow: 1, minWidth: 0, height: "100vh", bgcolor: C.bg, overflowY: "auto", overflowX: "hidden", position: "relative", zIndex: 1 }}
      >
        <Box
          sx={{
            p: 1.2,
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {isMobile && (
            <IconButton onClick={() => setMobileOpen(!mobileOpen)} sx={{ color: "white" }}>
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: "auto" }}>
            <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" sx={{ color: C.text, fontWeight: 600 }}>
                {user?.first_name || user?.username}
              </Typography>
              <Typography variant="caption" sx={{ color: C.textMuted }}>
                {user?.is_superuser ? "Administrateur" : "Utilisateur"}
              </Typography>
            </Box>
            <Avatar sx={{ width: 40, height: 40, bgcolor: user?.is_superuser ? C.danger : C.accent }}>
              {user?.first_name?.charAt(0) || user?.username?.charAt(0) || "U"}
            </Avatar>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
      
    
      

          {/* Filter + Search */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: activeFiltersCount > 0 ? 1.5 : 3 }}>
           
            <TextField
              placeholder="Rechercher par nom, contact, secteur, email, ville, registre, fiscal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: C.textMuted }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  color: C.textSub,
                  bgcolor: `rgba(59,130,246,0.05)`,
                  borderRadius: "10px",
                  "& fieldset": { borderColor: C.border },
                  "&:hover fieldset": { borderColor: C.borderHi },
                  "&.Mui-focused fieldset": { borderColor: C.accent },
                },
              }}
            />
          </Box>

          {/* Active filter chips */}
          {activeFiltersCount > 0 && (
            <Box sx={{ display: "flex", gap: 1, mb: 2.5, flexWrap: "wrap", alignItems: "center" }}>
              {filterStatus !== "all" && (
                <Chip label={statusOptions.find((s) => s.value === filterStatus)?.label}
                  onDelete={() => setFilterStatus("all")} size="small"
                  sx={{ bgcolor: C.accentDim, color: C.accent, border: `1px solid rgba(59,130,246,0.3)`, fontWeight: 500 }}
                />
              )}
              {filterSecteur && (
                <Chip 
                  label={secteurOptions.find((opt) => opt.value === filterSecteur)?.label || filterSecteur}
                  onDelete={() => setFilterSecteur("")} 
                  size="small"
                  sx={{ bgcolor: C.accentDim, color: C.accent, border: `1px solid rgba(59,130,246,0.3)`, fontWeight: 500 }}
                />
              )}
              <Button size="small" onClick={() => { setFilterStatus("all"); setFilterSecteur(""); }}
                sx={{ color: C.textMuted, fontSize: "0.75rem", textTransform: "none", py: 0, minHeight: 0, "&:hover": { color: C.danger } }}
              >
                Tout effacer
              </Button>
            </Box>
          )}

          {/* Suppliers Grid (Vertical Cards) */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress sx={{ color: C.accent }} />
            </Box>
          ) : filteredSuppliers.length > 0 ? (
            <Grid container spacing={3}>
              {filteredSuppliers.map((supplier) => (
                <Grid item xs={12} md={6} lg={4} key={supplier.id}>
                  <SupplierCard
                    supplier={supplier}
                    onEdit={handleOpenAddDialog}
                    onDelete={handleDeleteSupplier}
                    onToggleStatus={handleToggleStatus}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Card sx={{ bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", textAlign: "center", py: 6 }}>
              <BusinessIcon sx={{ fontSize: 64, color: C.border, mb: 2 }} />
              <Typography variant="h6" sx={{ color: C.text, mb: 1 }}>Aucun fournisseur trouvé</Typography>
              <Typography sx={{ color: C.textMuted }}>
                {searchQuery ? "Aucun fournisseur ne correspond à votre recherche." : "Commencez par ajouter un fournisseur."}
              </Typography>
            </Card>
          )}
        </Box>
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
        PaperProps={{
          sx: {
            bgcolor: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "12px",
            backdropFilter: "blur(12px)",
            minWidth: 240,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            mt: 0.5,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.2, borderBottom: `1px solid ${C.border}` }}>
          <Typography sx={{ color: C.textSub, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 0.75 }}>
            <FilterListIcon sx={{ fontSize: 14 }} />
            Statut
          </Typography>
        </Box>
        {statusOptions.map((opt) => (
          <MenuItem key={opt.value} onClick={() => setFilterStatus(opt.value)} sx={menuItemSx(filterStatus === opt.value)}>
            <span>{opt.label}</span>
            {filterStatus === opt.value && <CheckIcon sx={{ fontSize: 16, ml: "auto" }} />}
          </MenuItem>
        ))}

        {activeFiltersCount > 0 && (
          <>
            <Divider sx={{ borderColor: C.border, mt: 1 }} />
            <Box sx={{ p: 1.5 }}>
              <Button fullWidth size="small"
                onClick={() => { setFilterStatus("all"); setFilterAnchorEl(null); }}
                sx={{ color: C.danger, fontSize: "0.8rem", textTransform: "none", border: `1px solid rgba(239,68,68,0.3)`, borderRadius: "6px", "&:hover": { bgcolor: C.dangerDim } }}
              >
                Réinitialiser les filtres
              </Button>
            </Box>
          </>
        )}
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: 3, maxHeight: "90vh" } }}
      >
        <DialogTitle sx={{ color: C.text, fontWeight: 700, borderBottom: `1px solid ${C.border}`, fontSize: "1.25rem" }}>
          {formData.id ? "Modifier le fournisseur" : "Ajouter un fournisseur"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, overflowY: "auto" }}>
          {/* INFORMATIONS GÉNÉRALES */}
          <Typography variant="h6" sx={{ color: C.accent, fontWeight: 600, mb: 2, borderLeft: `4px solid ${C.accent}`, pl: 1.5 }}>
            INFORMATIONS GÉNÉRALES
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <TextField 
                label="Nom du fournisseur *" 
                value={formData.name} 
                fullWidth 
                size="medium"
                sx={largeInputSx}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Registre commercial / ICE" 
                value={formData.registre_commerce} 
                fullWidth 
                size="medium"
                sx={largeInputSx}
                onChange={(e) => setFormData({ ...formData, registre_commerce: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Identifiant fiscal / RC" 
                value={formData.identifiant_fiscal} 
                fullWidth 
                size="medium"
                sx={largeInputSx}
                onChange={(e) => setFormData({ ...formData, identifiant_fiscal: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="medium" sx={largeInputSx}>
                <InputLabel>Secteur / Catégorie</InputLabel>
                <Select
                  value={formData.secteur}
                  label="Secteur / Catégorie"
                  onChange={(e) => setFormData({ ...formData, secteur: e.target.value })}
                >
                  {secteurOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Ancienneté / Date création" 
                value={formData.anciennete} 
                fullWidth 
                size="medium"
                placeholder="Ex: 10 ans d'expérience"
                sx={largeInputSx}
                onChange={(e) => setFormData({ ...formData, anciennete: e.target.value })}
              />
            </Grid>
          </Grid>

          {/* CONTACT & LOCALISATION */}
          <Typography variant="h6" sx={{ color: C.accent, fontWeight: 600, mb: 2, borderLeft: `4px solid ${C.accent}`, pl: 1.5 }}>
            CONTACT & LOCALISATION
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Email" 
                type="email"
                value={formData.email} 
                fullWidth 
                size="medium"
                sx={largeInputSx}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Téléphone" 
                value={formData.phone} 
                fullWidth 
                size="medium"
                sx={largeInputSx}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                label="Contact principal" 
                value={formData.contact_name} 
                fullWidth 
                size="medium"
                sx={largeInputSx}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                label="Adresse" 
                value={formData.address} 
                fullWidth 
                size="medium"
                sx={largeInputSx}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Ville" 
                value={formData.city} 
                fullWidth 
                size="medium"
                sx={largeInputSx}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Pays" 
                value={formData.country} 
                fullWidth 
                size="medium"
                sx={largeInputSx}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </Grid>
          </Grid>

          {/* OFFRE COMMERCIALE */}
          <Typography variant="h6" sx={{ color: C.accent, fontWeight: 600, mb: 2, borderLeft: `4px solid ${C.accent}`, pl: 1.5 }}>
            OFFRE COMMERCIALE — CRITÈRES DE COMPARAISON
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Prix unitaire / Tarif" 
                value={formData.prix_unitaire} 
                fullWidth 
                size="medium"
                placeholder="Grille tarifaire ou prix proposé"
                sx={largeInputSx}
                onChange={(e) => setFormData({ ...formData, prix_unitaire: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="medium" sx={largeInputSx}>
                <InputLabel>Conditions de paiement</InputLabel>
                <Select
                  value={formData.conditions_paiement}
                  label="Conditions de paiement"
                  onChange={(e) => setFormData({ ...formData, conditions_paiement: e.target.value })}
                >
                  {conditionsPaiementOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Remise / Réduction" 
                value={formData.remise} 
                fullWidth 
                size="medium"
                placeholder="% selon volume ou fidélité"
                sx={largeInputSx}
                onChange={(e) => setFormData({ ...formData, remise: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Zone de couverture" 
                value={formData.zone_couverture} 
                fullWidth 
                size="medium"
                placeholder="Régions / pays desservis"
                sx={largeInputSx}
                onChange={(e) => setFormData({ ...formData, zone_couverture: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Minimum de commande" 
                value={formData.minimum_commande} 
                fullWidth 
                size="medium"
                placeholder="Quantité ou montant minimum"
                sx={largeInputSx}
                onChange={(e) => setFormData({ ...formData, minimum_commande: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Délai de livraison" 
                value={formData.delai_livraison} 
                fullWidth 
                size="medium"
                placeholder="Jours ouvrables / délai standard"
                sx={largeInputSx}
                onChange={(e) => setFormData({ ...formData, delai_livraison: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Certifications (ISO, etc.)" 
                value={formData.certifications} 
                fullWidth 
                size="medium"
                placeholder="ISO 9001, CE, normes sectorielles..."
                sx={largeInputSx}
                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Garantie produit / SAV" 
                value={formData.garantie_sav} 
                fullWidth 
                size="medium"
                placeholder="Durée et conditions de garantie"
                sx={largeInputSx}
                onChange={(e) => setFormData({ ...formData, garantie_sav: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                label="Références clients" 
                value={formData.references_clients} 
                fullWidth 
                size="medium"
                placeholder="Clients existants, témoignages"
                multiline
                rows={3}
                sx={largeInputSx}
                onChange={(e) => setFormData({ ...formData, references_clients: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                label="Capacité de production" 
                value={formData.capacite_production} 
                fullWidth 
                size="medium"
                placeholder="Volume max pouvant être fourni"
                sx={largeInputSx}
                onChange={(e) => setFormData({ ...formData, capacite_production: e.target.value })}
              />
            </Grid>
          </Grid>

          {/* ÉVALUATION ADMIN */}
          <Typography variant="h6" sx={{ color: C.accent, fontWeight: 600, mb: 2, borderLeft: `4px solid ${C.accent}`, pl: 1.5 }}>
            ÉVALUATION ADMIN (REMPLIE APRÈS COMPARAISON)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="medium" sx={largeInputSx}>
                <InputLabel>Note globale (1–5)</InputLabel>
                <Select
                  value={formData.note_globale}
                  label="Note globale (1–5)"
                  onChange={(e) => setFormData({ ...formData, note_globale: e.target.value })}
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <MenuItem key={n} value={n}>{n} / 5</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="medium" sx={largeInputSx}>
                <InputLabel>Statut du fournisseur</InputLabel>
                <Select
                  value={formData.is_active ? "active" : "inactive"}
                  label="Statut du fournisseur"
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "active" })}
                >
                  <MenuItem value="active">Actif</MenuItem>
                  <MenuItem value="inactive">Inactif</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField 
                label="Commentaires / Remarques" 
                value={formData.commentaires} 
                fullWidth 
                size="medium"
                placeholder="Notes libres de l'admin"
                multiline
                rows={4}
                sx={largeInputSx}
                onChange={(e) => setFormData({ ...formData, commentaires: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${C.border}` }}>
          <Button onClick={handleCloseAddDialog} sx={{ color: C.textMuted, fontSize: "1rem", py: 1, px: 3 }}>Annuler</Button>
          <Button onClick={handleSaveSupplier} variant="contained"
            sx={{ bgcolor: C.accent, fontWeight: 600, textTransform: "none", borderRadius: 2, py: 1, px: 4, fontSize: "1rem", "&:hover": { bgcolor: "#2563eb" } }}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={() => setSuccessMessage("")} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert severity="success" sx={{ width: "100%" }}>{successMessage}</Alert>
      </Snackbar>
      <Snackbar open={!!errorMessage} autoHideDuration={3000} onClose={() => setErrorMessage("")} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert severity="error" sx={{ width: "100%" }}>{errorMessage}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Fournisseur;