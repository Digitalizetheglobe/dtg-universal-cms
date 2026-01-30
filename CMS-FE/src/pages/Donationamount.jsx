import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/api";
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Gift,
  GraduationCap,
  UtensilsCrossed,
  Edit,
  Trash2,
  X,
} from "lucide-react";

const Donationamount = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [message, setMessage] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [activeCategory, setActiveCategory] = useState("food");

  // Form data for each category
  const [formData, setFormData] = useState({
    giftFuture: {
      text: "",
      yearText: "",
      amount: "",
    },
    giftLearning: {
      text: "",
      yearText: "",
      amount: "",
    },
    food: {
      text: "",
      amount: "",
    },
  });

  // Store all cards grouped by category
  const [cards, setCards] = useState({
    giftFuture: [],
    giftLearning: [],
    food: [],
  });

  // Fetch all cards on component mount
  useEffect(() => {
    fetchAllCards();
  }, []);

  const fetchAllCards = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/donation-amounts/grouped/by-category`
      );
      if (response.data.success && response.data.data) {
        setCards(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching cards:", error);
      setMessage({
        type: "error",
        text: "Failed to fetch donation cards",
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (category, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]:
          field === "amount"
            ? value === "" || value === null
              ? ""
              : Number(value)
            : value,
      },
    }));
  };

  const handleEditInputChange = (field, value) => {
    if (editingCard) {
      setEditingCard({
        ...editingCard,
        [field]:
          field === "amount"
            ? value === "" || value === null
              ? ""
              : Number(value)
            : value,
      });
    }
  };

  const createCard = async (category) => {
    setSaving((prev) => ({ ...prev, [category]: true }));
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({
          type: "error",
          text: "Authentication required. Please login.",
        });
        setTimeout(() => setMessage(null), 3000);
        return;
      }

      const amountValue =
        formData[category].amount === "" || formData[category].amount === null
          ? undefined
          : Number(formData[category].amount);

      const payload = {
        category,
        text: formData[category].text,
        amount: amountValue,
      };

      // Add yearText for gift categories
      if (category === "giftFuture" || category === "giftLearning") {
        payload.yearText = formData[category].yearText;
      }

      // Validate required fields
      if (!payload.text || payload.amount === undefined || payload.amount <= 0) {
        setMessage({
          type: "error",
          text: "Please fill in all required fields with valid values",
        });
        setTimeout(() => setMessage(null), 3000);
        return;
      }

      if (
        (category === "giftFuture" || category === "giftLearning") &&
        !payload.yearText
      ) {
        setMessage({
          type: "error",
          text: "Year text is required for gift categories",
        });
        setTimeout(() => setMessage(null), 3000);
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/donation-amounts`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // Reset form
        setFormData((prev) => ({
          ...prev,
          [category]:
            category === "food"
              ? { text: "", amount: "" }
              : { text: "", yearText: "", amount: "" },
        }));

        setMessage({
          type: "success",
          text: `${getTypeLabel(category)} card created successfully`,
        });
        setTimeout(() => setMessage(null), 3000);

        // Refresh cards
        fetchAllCards();
      }
    } catch (error) {
      console.error(`Error creating ${category} card:`, error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          `Failed to create ${getTypeLabel(category)} card`,
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving((prev) => ({ ...prev, [category]: false }));
    }
  };

  const updateCard = async () => {
    if (!editingCard) return;

    setSaving((prev) => ({ ...prev, editing: true }));
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({
          type: "error",
          text: "Authentication required. Please login.",
        });
        setTimeout(() => setMessage(null), 3000);
        return;
      }

      const amountValue =
        editingCard.amount === "" || editingCard.amount === null
          ? undefined
          : Number(editingCard.amount);

      const payload = {
        text: editingCard.text,
        amount: amountValue,
      };

      if (
        editingCard.category === "giftFuture" ||
        editingCard.category === "giftLearning"
      ) {
        payload.yearText = editingCard.yearText;
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/donation-amounts/${editingCard._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setMessage({
          type: "success",
          text: "Card updated successfully",
        });
        setTimeout(() => setMessage(null), 3000);

        setEditingCard(null);
        fetchAllCards();
      }
    } catch (error) {
      console.error("Error updating card:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.message || "Failed to update card",
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving((prev) => ({ ...prev, editing: false }));
    }
  };

  const deleteCard = async (cardId, category) => {
    if (!window.confirm("Are you sure you want to delete this card?")) {
      return;
    }

    setSaving((prev) => ({ ...prev, [cardId]: true }));
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({
          type: "error",
          text: "Authentication required. Please login.",
        });
        setTimeout(() => setMessage(null), 3000);
        return;
      }

      const response = await axios.delete(
        `${API_BASE_URL}/api/donation-amounts/${cardId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setMessage({
          type: "success",
          text: "Card deleted successfully",
        });
        setTimeout(() => setMessage(null), 3000);

        fetchAllCards();
      }
    } catch (error) {
      console.error("Error deleting card:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to delete card",
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving((prev) => ({ ...prev, [cardId]: false }));
    }
  };

  const startEditing = (card) => {
    setEditingCard({ ...card });
  };

  const cancelEditing = () => {
    setEditingCard(null);
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "giftFuture":
        return "Gift Future";
      case "giftLearning":
        return "Gift Learning";
      case "food":
        return "Food";
      default:
        return type;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "giftFuture":
        return <Gift className="h-5 w-5" />;
      case "giftLearning":
        return <GraduationCap className="h-5 w-5" />;
      case "food":
        return <UtensilsCrossed className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getFilterButtonClasses = (category) => {
    const base =
      "flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all sm:w-auto";

    if (activeCategory !== category) {
      return `${base} border-gray-300 bg-white text-gray-700 hover:bg-gray-50`;
    }

    switch (category) {
      case "giftFuture":
        return `${base} border-blue-300 bg-blue-50 text-blue-700`;
      case "giftLearning":
        return `${base} border-purple-300 bg-purple-50 text-purple-700`;
      case "food":
        return `${base} border-green-300 bg-green-50 text-green-700`;
      default:
        return `${base} border-gray-300 bg-gray-50 text-gray-800`;
    }
  };

  const renderFormCard = (category) => {
    const categoryData = formData[category];
    const isGiftCategory = category === "giftFuture" || category === "giftLearning";

    return (
      <div className="rounded-xl border border-border bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <div
            className={`rounded-lg p-2 ${category === "giftFuture"
              ? "bg-blue-100 text-blue-600"
              : category === "giftLearning"
                ? "bg-purple-100 text-purple-600"
                : "bg-green-100 text-green-600"
              }`}
          >
            {getTypeIcon(category)}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {getTypeLabel(category)}
            </h2>
            <p className="text-sm text-gray-500">Create new donation card</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Text <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={categoryData.text}
              onChange={(e) =>
                handleInputChange(category, "text", e.target.value)
              }
              className={`w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 ${category === "giftFuture"
                ? "focus:border-blue-500 focus:ring-blue-200"
                : category === "giftLearning"
                  ? "focus:border-purple-500 focus:ring-purple-200"
                  : "focus:border-green-500 focus:ring-green-200"
                }`}
              placeholder="Enter text"
            />
          </div>

          {isGiftCategory && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Year Text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={categoryData.yearText}
                onChange={(e) =>
                  handleInputChange(category, "yearText", e.target.value)
                }
                className={`w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 ${category === "giftFuture"
                  ? "focus:border-blue-500 focus:ring-blue-200"
                  : "focus:border-purple-500 focus:ring-purple-200"
                  }`}
                placeholder="Enter year text"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Amount <span className="text-red-500">*</span>
            </label>
            {/* <input
              type="number"
              value={categoryData.amount}
              onChange={(e) =>
                handleInputChange(category, "amount", e.target.value)
              }
              className={`w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 ${
                category === "giftFuture"
                  ? "focus:border-blue-500 focus:ring-blue-200"
                  : category === "giftLearning"
                  ? "focus:border-purple-500 focus:ring-purple-200"
                  : "focus:border-green-500 focus:ring-green-200"
              }`}
              placeholder="Enter amount"
              min="0"
              step="1"
            /> */}
            <input
              type="number"
              value={categoryData.amount === "" ? "" : categoryData.amount}
              onChange={(e) =>
                handleInputChange(category, "amount", e.target.value)
              }
              onWheel={(e) => e.currentTarget.blur()}
              placeholder="Enter amount"
              min="0"
              step="1"
              className={`w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 ${category === "giftFuture"
                  ? "focus:border-blue-500 focus:ring-blue-200"
                  : category === "giftLearning"
                    ? "focus:border-purple-500 focus:ring-purple-200"
                    : "focus:border-green-500 focus:ring-green-200"
                }`}
            />
          </div>

          <button
            onClick={() => createCard(category)}
            disabled={saving[category]}
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${category === "giftFuture"
              ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              : category === "giftLearning"
                ? "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
                : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
              }`}
          >
            {saving[category] ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderCardItem = (card) => {
    const isEditing = editingCard && editingCard._id === card._id;
    const isGiftCategory =
      card.category === "giftFuture" || card.category === "giftLearning";

    return (
      <div
        key={card._id}
        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      >
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Text
              </label>
              <input
                type="text"
                value={editingCard.text}
                onChange={(e) => handleEditInputChange("text", e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {isGiftCategory && (
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Year Text
                </label>
                <input
                  type="text"
                  value={editingCard.yearText}
                  onChange={(e) =>
                    handleEditInputChange("yearText", e.target.value)
                  }
                  className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Amount
              </label>
              <input
                type="number"
                value={editingCard.amount === "" ? "" : editingCard.amount}
                onChange={(e) =>
                  handleEditInputChange("amount", e.target.value)
                }
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={updateCard}
                disabled={saving.editing}
                className="flex-1 rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving.editing ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </button>
              <button
                onClick={cancelEditing}
                className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-800">{card.text}</p>
              {isGiftCategory && (
                <p className="mt-1 text-xs text-gray-600">
                  Year: {card.yearText}
                </p>
              )}
              <p className="mt-1 text-lg font-bold text-gray-900">
                ₹{card.amount.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEditing(card)}
                className="flex items-center gap-1 rounded border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
              >
                <Edit className="h-3 w-3" />
                Edit
              </button>
              <button
                onClick={() => deleteCard(card._id, card.category)}
                disabled={saving[card._id]}
                className="flex items-center gap-1 rounded border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                {saving[card._id] ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCardsSection = (category) => {
    const categoryCards = cards[category] || [];

    if (categoryCards.length === 0) {
      return null;
    }

    return (
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          {getTypeIcon(category)}
          <h3 className="text-xl font-semibold text-gray-800">
            {getTypeLabel(category)} Cards ({categoryCards.length})
          </h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categoryCards.map((card) => renderCardItem(card))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Donation Amount Management
          </h1>
          <p className="mt-2 text-gray-600">
            Create and manage donation cards for different categories
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-lg border p-4 ${message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
              }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        {/* Form Cards Grid */}
        <div className="mb-12 grid gap-6 lg:grid-cols-3">
          {renderFormCard("food")}
          {renderFormCard("giftLearning")}
          {renderFormCard("giftFuture")}
        </div>

        {/* Display Created Cards by Category */}
        <div className="mb-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Created Donation Cards
            </h2>

            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveCategory("food")}
                className={getFilterButtonClasses("food")}
              >
                {getTypeIcon("food")}
                Food
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("giftLearning")}
                className={getFilterButtonClasses("giftLearning")}
              >
                {getTypeIcon("giftLearning")}
                Gift Learning
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("giftFuture")}
                className={getFilterButtonClasses("giftFuture")}
              >
                {getTypeIcon("giftFuture")}
                Gift Future
              </button>
             
            </div>
          </div>

          {activeCategory === "giftFuture" && renderCardsSection("giftFuture")}
          {activeCategory === "giftLearning" && renderCardsSection("giftLearning")}
          {activeCategory === "food" && renderCardsSection("food")}

          {cards.giftFuture.length > 0 ||
          cards.giftLearning.length > 0 ||
          cards.food.length > 0 ? (
            (cards[activeCategory]?.length || 0) === 0 && (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
                <p className="text-gray-500">
                  No {getTypeLabel(activeCategory)} cards created yet.
                </p>
              </div>
            )
          ) : null}

          {cards.giftFuture.length === 0 &&
            cards.giftLearning.length === 0 &&
            cards.food.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
                <p className="text-gray-500">
                  No cards created yet. Use the forms above to create donation
                  cards.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Donationamount;
