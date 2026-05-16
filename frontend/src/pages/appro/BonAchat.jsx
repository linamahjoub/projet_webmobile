import React, { useEffect, useMemo, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stepper,
  Step,
  StepLabel,
  Paper,
  LinearProgress,
} from "@mui/material";
import {
  Business as BusinessIcon,
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
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  AttachMoney as AttachMoneyIcon,
  LocalShipping as LocalShippingIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  Close as CloseIcon,
  ShoppingCart as ShoppingCartIcon,
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

/* ─── Utility function to extract numeric price ─────────────────────────── */
const extractNumericPrice = (priceString) => {
  if (!priceString) return "";
  // Extraire les chiffres et le point/virgule (ex: "865.00 DH / tonne" → "865.00")
  const match = String(priceString).match(/(\d+(?:[.,]\d+)?)/);
  return match ? match[1].replace(",", ".") : "";
};

/* ─── Purchase Order Page ─────────────────────────────────────────────────── */
const BonAchat = () => {
  const { user } = useAuth();
  const { triggerActivityRefresh } = useActivityContext();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedSupplierForDialog, setSelectedSupplierForDialog] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  // Form data
  const [formData, setFormData] = useState({
    id: null,
    supplier: "",
    expected_delivery_date: "",
    status: "pending",
    items: [],
  });

  const [newItem, setNewItem] = useState({
    product: "",
    quantity: "",
    unit_price: "",
  });

  const API_BASE = "http://localhost:8000/api/purchase/";

  // Récupérer les données au chargement
  useEffect(() => {
    fetchData();
  }, []);

  // Récupérer le fournisseur depuis le state de navigation
  useEffect(() => {
    if (location.state?.selectedSupplier && suppliers.length > 0) {
      const supplierExists = suppliers.find(s => s.id === location.state.selectedSupplier.id);
      if (supplierExists) {
        setSelectedSupplierForDialog(location.state.selectedSupplier);
        setFormData(prev => ({ ...prev, supplier: location.state.selectedSupplier.id }));
        setOpenDialog(true);
      }
    }
  }, [location.state, suppliers]);

  // Quand le fournisseur est sélectionné, pré-remplir le prix unitaire et filtrer les produits
  useEffect(() => {
    if (formData.supplier && suppliers.length > 0) {
      const selectedSupplier = suppliers.find(s => s.id === formData.supplier);
      
      if (selectedSupplier) {
        // Pré-remplir le prix unitaire du fournisseur (extraire le nombre)
        if (selectedSupplier.prix_unitaire && !newItem.unit_price) {
          const numericPrice = extractNumericPrice(selectedSupplier.prix_unitaire);
          setNewItem(prev => ({ ...prev, unit_price: numericPrice }));
        }

        // Filtrer les produits par secteur/famille du fournisseur
        const productsInSector = products.filter(p => 
          p.material_type === selectedSupplier.secteur
        );
        setFilteredProducts(productsInSector);
      } else {
        // Si le fournisseur n'existe pas dans la liste, réinitialiser
        setFilteredProducts([]);
        setNewItem({ product: "", quantity: "", unit_price: "" });
      }
    } else {
      setFilteredProducts([]);
      setNewItem({ product: "", quantity: "", unit_price: "" });
    }
  }, [formData.supplier, suppliers, products]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const headers = token ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };

      const [poRes, suppRes, prodRes] = await Promise.all([
        fetch(`${API_BASE}purchase-orders/`, { headers }),
        fetch("http://localhost:8000/api/fournisseurs/", { headers }),
        fetch("http://localhost:8000/api/stock/products/", { headers }),
      ]);

      if (poRes.ok) {
        const data = await poRes.json();
        setPurchaseOrders(Array.isArray(data) ? data : data.results || []);
      }
      if (suppRes.ok) {
        const data = await suppRes.json();
        setSuppliers(Array.isArray(data) ? data : data.results || []);
      }
      if (prodRes.ok) {
        const data = await prodRes.json();
        setProducts(Array.isArray(data) ? data : data.results || []);
      }
    } catch (error) {
      setErrorMessage("Erreur lors du chargement des données");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (po = null) => {
    if (po) {
      setFormData(po);
    } else {
      setFormData({
        id: null,
        supplier: "",
        expected_delivery_date: "",
        status: "pending",
        items: [],
      });
    }
    setNewItem({ product: "", quantity: "", unit_price: "" });
    setActiveStep(0);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setActiveStep(0);
    setFormData({
      id: null,
      supplier: "",
      expected_delivery_date: "",
      status: "pending",
      items: [],
    });
    setSelectedSupplierForDialog(null);
  };

  const nextStep = () => {
    if (activeStep === 0 && !formData.supplier) {
      setErrorMessage("Veuillez sélectionner un fournisseur");
      return;
    }
    if (activeStep === 1 && !formData.expected_delivery_date) {
      setErrorMessage("Veuillez sélectionner une date de livraison");
      return;
    }
    setErrorMessage("");
    setActiveStep(prev => prev + 1);
  };

  const prevStep = () => {
    setErrorMessage("");
    setActiveStep(prev => prev - 1);
  };

  const handleAddItem = () => {
    if (!newItem.product || !newItem.quantity || !newItem.unit_price) {
      setErrorMessage("Veuillez remplir tous les champs de l'article");
      return;
    }

    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product: parseInt(newItem.product),
          quantity: parseInt(newItem.quantity),
          unit_price: parseFloat(newItem.unit_price),
        },
      ],
    }));

    // Récupérer le prix unitaire du fournisseur pour le pré-remplir à nouveau
    const selectedSupplier = suppliers.find(s => s.id === formData.supplier);
    const numericPrice = selectedSupplier?.prix_unitaire ? extractNumericPrice(selectedSupplier.prix_unitaire) : "";

    setNewItem({ product: "", quantity: "", unit_price: numericPrice });
    setSuccessMessage("Article ajouté");
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSavePurchaseOrder = async () => {
    if (!formData.supplier || !formData.expected_delivery_date || formData.items.length === 0) {
      setErrorMessage("Fournisseur, date de livraison et articles requis");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const isUpdate = Boolean(formData.id);
      const headers = token ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
      
      const payload = {
        supplier: formData.supplier,
        expected_delivery_date: formData.expected_delivery_date,
        status: formData.status,
        items: formData.items,
      };

      console.log("Payload envoyé:", JSON.stringify(payload, null, 2));

      const response = await fetch(
        isUpdate ? `${API_BASE}purchase-orders/${formData.id}/` : `${API_BASE}purchase-orders/`,
        {
          method: isUpdate ? "PUT" : "POST",
          headers: headers,
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: "Erreur serveur (impossible de parser la réponse)" };
        }
        console.error("Erreur backend complet:", JSON.stringify(errorData, null, 2));
        
        // Formatter le message d'erreur pour afficher les détails des champs
        let errorMsg = "";
        
        // Vérifier s'il y a une erreur générale
        if (errorData.error) {
          errorMsg = errorData.error;
        }
        
        // Vérifier les erreurs sur les articles
        if (errorData.items) {
          if (Array.isArray(errorData.items)) {
            // C'est un tableau d'erreurs
            errorData.items.forEach((itemErr, idx) => {
              if (typeof itemErr === 'object') {
                Object.entries(itemErr).forEach(([field, msgs]) => {
                  const msgText = Array.isArray(msgs) ? msgs.join(", ") : msgs;
                  errorMsg += `${errorMsg ? "\n" : ""}Article ${idx + 1} - ${field}: ${msgText}`;
                });
              } else {
                errorMsg += `${errorMsg ? "\n" : ""}Article ${idx + 1}: ${itemErr}`;
              }
            });
          } else if (typeof errorData.items === 'object') {
            Object.entries(errorData.items).forEach(([field, msgs]) => {
              const msgText = Array.isArray(msgs) ? msgs.join(", ") : msgs;
              errorMsg += `${errorMsg ? "\n" : ""}${field}: ${msgText}`;
            });
          }
        }
        
        // Vérifier les autres champs d'erreur
        Object.keys(errorData).forEach((key) => {
          if (key !== 'items' && key !== 'error' && errorData[key]) {
            const msgText = Array.isArray(errorData[key]) ? errorData[key].join(", ") : errorData[key];
            errorMsg += `${errorMsg ? "\n" : ""}${key}: ${msgText}`;
          }
        });
        
        if (!errorMsg) {
          errorMsg = JSON.stringify(errorData) || "Erreur lors de l'enregistrement";
        }
        
        console.error("Message d'erreur formaté:", errorMsg);
        setErrorMessage(errorMsg);
        return;
      }

      const saved = await response.json();
      if (isUpdate) {
        setPurchaseOrders(purchaseOrders.map((p) => (p.id === saved.id ? saved : p)));
        setSuccessMessage("Bon d'achat mis à jour");
      } else {
        setPurchaseOrders([saved, ...purchaseOrders]);
        setSuccessMessage("Bon d'achat créé avec succès");
        triggerActivityRefresh();
      }
      handleCloseDialog();
    } catch (error) {
      setErrorMessage("Erreur réseau");
      console.error(error);
    }
  };

  const handleDeletePurchaseOrder = async (id) => {
    if (!window.confirm("Confirmer la suppression?")) return;

    try {
      const token = localStorage.getItem("access_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const response = await fetch(`${API_BASE}purchase-orders/${id}/`, {
        method: "DELETE",
        headers: headers,
      });

      if (!response.ok) {
        setErrorMessage("Erreur lors de la suppression");
        return;
      }

      setPurchaseOrders(purchaseOrders.filter((p) => p.id !== id));
      setSuccessMessage("Bon d'achat supprimé");
    } catch (error) {
      setErrorMessage("Erreur réseau");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const response = await fetch(
        `${API_BASE}purchase-orders/${id}/${newStatus === "approved" ? "approve" : newStatus}/`,
        {
          method: "POST",
          headers: headers,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || "Erreur lors du changement de statut";
        setErrorMessage(errorMessage);
        return;
      }

      const updated = await response.json();
      setPurchaseOrders(purchaseOrders.map((p) => (p.id === updated.id ? updated : p)));
      setSuccessMessage("Statut mis à jour");
    } catch (error) {
      setErrorMessage("Erreur réseau");
    }
  };

  const handleExportPDF = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      
      const response = await fetch(`${API_BASE}purchase-orders/${id}/export_pdf/`, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        setErrorMessage("Erreur lors de l'export PDF");
        return;
      }

      // Créer un blob à partir de la réponse
      const blob = await response.blob();
      
      // Créer une URL temporaire pour le blob
      const urlBlob = window.URL.createObjectURL(blob);
      
      // Créer un lien de téléchargement
      const link = document.createElement("a");
      link.href = urlBlob;
      link.download = `bon_achat_${id}.pdf`;
      
      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
      
      setSuccessMessage("PDF téléchargé avec succès");
    } catch (error) {
      console.error("Erreur lors du téléchargement du PDF:", error);
      setErrorMessage("Erreur lors du téléchargement du PDF");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = purchaseOrders.filter((po) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || (
      po.supplier_name?.toLowerCase().includes(q) ||
      po.supplier_email?.toLowerCase().includes(q) ||
      po.created_by_name?.toLowerCase().includes(q)
    );

    const matchesStatus = filterStatus === "all" || po.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalAmount = useMemo(() => {
    return formData.items.reduce((sum, item) => {
      const quantity = parseInt(item.quantity) || 0;
      const unitPrice = parseFloat(item.unit_price) || 0;
      return sum + quantity * unitPrice;
    }, 0);
  }, [formData.items]);

  const statusOptions = [
    { value: "all", label: "Tous les statuts" },
    { value: "pending", label: "En attente" },
    { value: "approved", label: "Approuvée" },
    { value: "sent", label: "Envoyée" },
    { value: "delivered", label: "Livrée" },
    { value: "cancelled", label: "Annulée" },
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: C.warning,
      approved: C.info,
      sent: C.accent,
      delivered: C.success,
      cancelled: C.danger,
    };
    return colors[status] || C.textMuted;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "En attente",
      approved: "Approuvée",
      sent: "Envoyée",
      delivered: "Livrée",
      cancelled: "Annulée",
    };
    return labels[status] || status;
  };

  const largeInputSx = {
    "& .MuiOutlinedInput-root": {
      color: C.textSub,
      "& fieldset": { borderColor: C.border },
      "&:hover fieldset": { borderColor: C.borderHi },
      "&.Mui-focused fieldset": { borderColor: C.accent },
      bgcolor: "rgba(0,0,0,0.3)",
      borderRadius: "10px",
    },
    "& .MuiInputLabel-root": { color: C.textMuted },
    "& .MuiInputLabel-root.Mui-focused": { color: C.accent },
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: C.bg, overflow: "hidden", position: "relative" }}>
      <SharedSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(!mobileOpen)} selectedMenu="bon_achat" />

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, height: "100vh", bgcolor: C.bg, overflowY: "auto", overflowX: "hidden", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ p: 1.2, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          {isMobile && (
            <IconButton onClick={() => setMobileOpen(!mobileOpen)} sx={{ color: C.text }}>
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" sx={{ color: C.text, fontWeight: 600 }}>
                {user?.first_name || user?.username}
              </Typography>
              <Typography variant="caption" sx={{ color: C.textMuted }}>
                {user?.is_superuser ? "Administrateur" : "Responsable Approvisionnement"}
              </Typography>
            </Box>
            <Avatar sx={{ width: 40, height: 40, bgcolor: C.accent, fontWeight: 600, fontSize: "1rem" }}>
              {user?.first_name?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Titre */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ color: C.text, fontWeight: 700, mb: 0.5 }}>
                Bons d'Achat
              </Typography>
              <Typography variant="body2" sx={{ color: C.textMuted }}>
                Gérez vos commandes auprès des fournisseurs
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ bgcolor: C.success, color: "white", textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "#059669" } }}
            >
              Créer un bon d'achat
            </Button>
          </Box>

          {/* Barre de recherche et filtres */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Tooltip title="Filtres">
              <IconButton
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                sx={{ color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: "10px", width: 44, height: 44 }}
              >
                <CiFilter size={22} />
              </IconButton>
            </Tooltip>

            <TextField
              placeholder="Rechercher par fournisseur, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: C.textMuted }} /></InputAdornment> }}
              sx={{ flex: 1, "& .MuiOutlinedInput-root": { color: C.textSub, bgcolor: hexToRgba(C.accent, 0.05), borderRadius: "10px", "& fieldset": { borderColor: C.border }, "&:hover fieldset": { borderColor: C.borderHi }, "&.Mui-focused fieldset": { borderColor: C.accent } } }}
            />

            <Tooltip title="Actualiser">
              <IconButton onClick={fetchData} sx={{ color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: "10px", width: 44, height: 44 }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Liste des commandes */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress sx={{ color: C.accent }} />
            </Box>
          ) : filteredOrders.length > 0 ? (
            <TableContainer sx={{ bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: hexToRgba(C.accent, 0.08), borderBottom: `2px solid ${C.border}` }}>
                    <TableCell sx={{ color: C.text, fontWeight: 700 }}>ID</TableCell>
                    <TableCell sx={{ color: C.text, fontWeight: 700 }}>Fournisseur</TableCell>
                    <TableCell sx={{ color: C.text, fontWeight: 700 }}>Date livraison</TableCell>
                    <TableCell sx={{ color: C.text, fontWeight: 700 }}>Montant</TableCell>
                    <TableCell sx={{ color: C.text, fontWeight: 700 }}>Statut</TableCell>
                    <TableCell sx={{ color: C.text, fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((po) => (
                    <TableRow key={po.id} sx={{ borderBottom: `1px solid ${C.border}`, "&:hover": { bgcolor: hexToRgba(C.accent, 0.05) } }}>
                      <TableCell sx={{ color: C.text }}>#{po.id}</TableCell>
                      <TableCell sx={{ color: C.text }}>{po.supplier_name}</TableCell>
                      <TableCell sx={{ color: C.textSub }}>{po.expected_delivery_date}</TableCell>
                      <TableCell sx={{ color: C.success, fontWeight: 600 }}>{po.total_amount} DH</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(po.status)}
                          size="small"
                          sx={{ bgcolor: hexToRgba(getStatusColor(po.status), 0.15), color: getStatusColor(po.status), fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {user?.is_superuser && po.status === "pending" && (
                            <Tooltip title="Accepter le bon d'achat">
                              <IconButton
                                size="small"
                                onClick={() => handleStatusChange(po.id, "approved")}
                                sx={{ color: C.success }}
                              >
                                <CheckIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Télécharger PDF">
                            <IconButton
                              size="small"
                              onClick={() => handleExportPDF(po.id)}
                              sx={{ color: "#ef4444" }}
                            >
                              <FileDownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Éditer">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(po)}
                              sx={{ color: C.accent }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              onClick={() => handleDeletePurchaseOrder(po.id)}
                              sx={{ color: C.danger }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Card sx={{ bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", textAlign: "center", py: 6 }}>
              <ReceiptIcon sx={{ fontSize: 64, color: C.border, mb: 2 }} />
              <Typography variant="h6" sx={{ color: C.text, mb: 1 }}>
                Aucun bon d'achat
              </Typography>
              <Typography sx={{ color: C.textMuted }}>
                {searchQuery ? "Aucun résultat pour votre recherche" : "Commencez par créer un bon d'achat"}
              </Typography>
            </Card>
          )}
        </Box>
      </Box>

      {/* Dialogue de création/édition avec Stepper */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: "16px", overflow: "hidden", position: "relative" } }}>
        {/* Header professionnel */}
        <Box sx={{ p: 3, borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
              <ReceiptIcon sx={{ color: C.accent, fontSize: 24 }} />
              <Typography sx={{ color: C.text, fontSize: "1.25rem", fontWeight: 700 }}>
                {formData.id ? "Modifier le bon d'achat" : "Créer un bon d'achat"}
              </Typography>
            </Box>
            <Typography sx={{ color: C.textMuted, fontSize: "0.875rem" }}>
              {formData.id ? "Mettez à jour les détails de votre commande" : "Configurez votre nouvelle commande auprès d'un fournisseur"}
            </Typography>
            <Chip label={`Étape ${activeStep + 1} / 3`} size="small" sx={{ mt: 1, bgcolor: C.accentDim, color: C.accent }} />
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: C.textMuted }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Stepper */}
        <Box sx={{ px: 3, pt: 3 }}>
          <Stepper activeStep={activeStep}>
            {["Fournisseur", "Détails", "Articles"].map((label) => (
              <Step key={label}>
                <StepLabel sx={{ "& .MuiStepLabel-label": { color: C.textMuted }, "& .MuiStepLabel-label.Mui-active": { color: C.text }, "& .MuiStepIcon-root": { color: C.border }, "& .MuiStepIcon-root.Mui-active": { color: C.accent }, "& .MuiStepIcon-root.Mui-completed": { color: C.success } }}>
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <DialogContent sx={{ p: 3, minHeight: 380 }}>
          {/* ÉTAPE 0 — Fournisseur */}
          {activeStep === 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <FormControl fullWidth size="medium" sx={largeInputSx}>
                <InputLabel sx={{ fontWeight: 500 }}>Sélectionner un fournisseur *</InputLabel>
                <Select
                  value={formData.supplier}
                  label="Sélectionner un fournisseur *"
                  onChange={(e) => {
                    const selectedSupplierId = e.target.value;
                    setFormData({ ...formData, supplier: selectedSupplierId });
                    const selected = suppliers.find(s => s.id === selectedSupplierId);
                    setSelectedSupplierForDialog(selected);
                  }}
                >
                  {suppliers.map((supp) => (
                    <MenuItem key={supp.id} value={supp.id}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                        <BusinessIcon sx={{ fontSize: 18, color: C.accent }} />
                        <Box>
                          <Typography sx={{ fontWeight: 600 }}>{supp.name}</Typography>
                          <Typography variant="caption" sx={{ color: C.textMuted }}>
                            {supp.email || "Sans email"}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Infos fournisseur */}
              {formData.supplier && selectedSupplierForDialog && (
                <Paper sx={{ bgcolor: hexToRgba(C.accent, 0.08), border: `2px solid ${C.accent}`, p: 2.5, borderRadius: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                        <EmailIcon sx={{ color: C.accent, mt: 0.5 }} />
                        <Box>
                          <Typography variant="caption" sx={{ color: C.textMuted, display: "block", mb: 0.5 }}>
                            Email
                          </Typography>
                          <Typography sx={{ color: C.text, fontWeight: 500 }}>
                            {selectedSupplierForDialog.email || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                        <PhoneIcon sx={{ color: C.accent, mt: 0.5 }} />
                        <Box>
                          <Typography variant="caption" sx={{ color: C.textMuted, display: "block", mb: 0.5 }}>
                            Téléphone
                          </Typography>
                          <Typography sx={{ color: C.text, fontWeight: 500 }}>
                            {selectedSupplierForDialog.phone || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              )}
            </Box>
          )}

          {/* ÉTAPE 1 — Détails de la commande */}
          {activeStep === 1 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                label="Date de livraison attendue"
                type="date"
                value={formData.expected_delivery_date}
                onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                fullWidth
                size="medium"
                sx={largeInputSx}
                InputLabelProps={{ shrink: true }}
                required
              />

              <Box>
                <Typography sx={{ color: C.textSub, fontSize: "0.85rem", fontWeight: 500, mb: 1.5 }}>
                  Statut de la commande
                </Typography>
                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                  {statusOptions.filter(opt => opt.value !== "all").map((opt) => (
                    <Chip
                      key={opt.value}
                      label={opt.label}
                      onClick={() => setFormData({ ...formData, status: opt.value })}
                      sx={{
                        bgcolor: formData.status === opt.value ? C.accentDim : C.surfaceHi,
                        color: formData.status === opt.value ? C.accent : C.textMuted,
                        border: `1px solid ${formData.status === opt.value ? C.accent : C.border}`,
                        fontWeight: 600,
                        cursor: "pointer",
                        "&:hover": {
                          bgcolor: C.accentDim,
                          borderColor: C.accent,
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          )}

          {/* ÉTAPE 2 — Articles */}
          {activeStep === 2 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Paper sx={{ bgcolor: hexToRgba(C.accent, 0.05), border: `1px solid ${C.border}`, p: 2.5, borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={5}>
                    <FormControl fullWidth size="small" sx={largeInputSx}>
                      <InputLabel>Produit *</InputLabel>
                      <Select
                        value={newItem.product}
                        label="Produit *"
                        onChange={(e) => setNewItem({ ...newItem, product: e.target.value })}
                      >
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((prod) => (
                            <MenuItem key={prod.id} value={prod.id}>
                              {prod.name} ({prod.sku || prod.code})
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>
                            Aucun produit disponible
                          </MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={2.5}>
                    <TextField
                      label="Quantité"
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                      fullWidth
                      size="small"
                      sx={largeInputSx}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={2.5}>
                    <TextField
                      label="Prix (DH)"
                      type="number"
                      value={newItem.unit_price}
                      onChange={(e) => setNewItem({ ...newItem, unit_price: e.target.value })}
                      fullWidth
                      size="small"
                      sx={largeInputSx}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={2}>
                    <Button
                      variant="contained"
                      onClick={handleAddItem}
                      fullWidth
                      sx={{ bgcolor: C.success, color: "white", fontWeight: 600, textTransform: "none", height: "40px", "&:hover": { bgcolor: "#059669" } }}
                    >
                      Ajouter
                    </Button>
                  </Grid>
                </Grid>
              </Paper>

              {/* Articles listing */}
              {formData.items.length > 0 && (
                <>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <Badge badgeContent={formData.items.length} color="primary">
                        <ShoppingCartIcon sx={{ color: C.accent, fontSize: 20 }} />
                      </Badge>
                      <Typography sx={{ color: C.text, fontWeight: 600 }}>
                        Articles ({formData.items.length})
                      </Typography>
                    </Box>
                    <TableContainer sx={{ bgcolor: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 2, overflow: "hidden" }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: hexToRgba(C.accent, 0.15) }}>
                            <TableCell sx={{ color: C.text, fontWeight: 700 }}>Produit</TableCell>
                            <TableCell align="center" sx={{ color: C.text, fontWeight: 700 }}>Quantité</TableCell>
                            <TableCell align="right" sx={{ color: C.text, fontWeight: 700 }}>Prix Unitaire</TableCell>
                            <TableCell align="right" sx={{ color: C.text, fontWeight: 700 }}>Total</TableCell>
                            <TableCell align="center" sx={{ color: C.text, fontWeight: 700 }}>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {formData.items.map((item, idx) => {
                            const product = products.find((p) => p.id === item.product);
                            const unitPrice = parseFloat(item.unit_price) || 0;
                            const quantity = parseInt(item.quantity) || 0;
                            return (
                              <TableRow key={idx} sx={{ borderBottom: `1px solid ${C.border}`, "&:hover": { bgcolor: hexToRgba(C.accent, 0.05) } }}>
                                <TableCell sx={{ color: C.text, fontWeight: 500 }}>{product?.name}</TableCell>
                                <TableCell align="center" sx={{ color: C.text }}>
                                  <Chip label={quantity} size="small" variant="outlined" sx={{ borderColor: C.accent, color: C.accent }} />
                                </TableCell>
                                <TableCell align="right" sx={{ color: C.text }}>{unitPrice.toFixed(2)} DH</TableCell>
                                <TableCell align="right" sx={{ color: C.success, fontWeight: 700 }}>{(quantity * unitPrice).toFixed(2)} DH</TableCell>
                                <TableCell align="center">
                                  <IconButton size="small" onClick={() => handleRemoveItem(idx)} sx={{ color: C.danger }}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Box sx={{ mt: 2, p: 2.5, bgcolor: hexToRgba(C.success, 0.12), border: `2px solid ${C.success}`, borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography sx={{ color: C.textMuted, fontSize: "0.9rem", mb: 0.5 }}>
                          Montant total
                        </Typography>
                        <Typography sx={{ color: C.success, fontWeight: 700, fontSize: "1.3rem" }}>
                          {totalAmount.toFixed(2)} DH
                        </Typography>
                      </Box>
                      <AttachMoneyIcon sx={{ fontSize: 40, color: C.success, opacity: 0.3 }} />
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          )}

          {errorMessage && (
            <Alert severity="error" onClose={() => setErrorMessage("")} sx={{ mt: 2 }}>
              {errorMessage}
            </Alert>
          )}
        </DialogContent>

        {/* Footer */}
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${C.border}`, justifyContent: "space-between" }}>
          <Button onClick={prevStep} disabled={activeStep === 0} sx={{ color: C.textMuted }}>
            Précédent
          </Button>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button onClick={handleCloseDialog} sx={{ color: C.textMuted }}>
              Annuler
            </Button>
            {activeStep === 2 ? (
              <Button
                variant="contained"
                onClick={handleSavePurchaseOrder}
                disabled={loading}
                sx={{ background: `linear-gradient(135deg, ${C.accent} 0%, #2563eb 100%)`, color: "white", fontWeight: 600, textTransform: "none" }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : (formData.id ? "Mettre à jour" : "Créer")}
              </Button>
            ) : (
              <Button variant="contained" onClick={nextStep} sx={{ background: `linear-gradient(135deg, ${C.accent} 0%, #2563eb 100%)`, color: "white", fontWeight: 600, textTransform: "none" }}>
                Suivant
              </Button>
            )}
          </Box>
        </DialogActions>

        {loading && <LinearProgress sx={{ position: "absolute", bottom: 0, left: 0, right: 0 }} />}
      </Dialog>

      {/* Menu filtres */}
      <Menu anchorEl={filterAnchorEl} open={Boolean(filterAnchorEl)} onClose={() => setFilterAnchorEl(null)} PaperProps={{ sx: { bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px" } }}>
        {statusOptions.map((opt) => (
          <MenuItem
            key={opt.value}
            onClick={() => {
              setFilterStatus(opt.value);
              setFilterAnchorEl(null);
            }}
            sx={{ px: 2, py: 0.8, color: filterStatus === opt.value ? C.accent : C.textSub }}
          >
            {opt.label}
            {filterStatus === opt.value && <CheckIcon sx={{ fontSize: 16, ml: "auto" }} />}
          </MenuItem>
        ))}
      </Menu>

      {/* Notifications */}
      <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={() => setSuccessMessage("")} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert severity="success">{successMessage}</Alert>
      </Snackbar>
      <Snackbar open={!!errorMessage} autoHideDuration={3000} onClose={() => setErrorMessage("")} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert severity="error">{errorMessage}</Alert>
      </Snackbar>
    </Box>
  );
};

export default BonAchat;
