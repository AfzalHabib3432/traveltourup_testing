"use client";
import React, { useState } from "react";
import { Link } from "@/i18n/navigation";
import { X, Star, Check, TrendingUp } from "lucide-react";

export interface ComparisonItem {
  id: number;
  name: string;
  [key: string]: any;
}

export interface ComparisonConfig {
  type: 'cars' | 'flights' | 'hotels';
  maxItems: number;
  modalTitle: string;
  floatingBarIcon: React.ReactNode;
  bookingUrl: string;
  buttonText: string;
  tips: string[];
  renderItem: (item: ComparisonItem) => React.ReactNode;
}

/** Detail page for compare modal title links (matches app routes). */
export function getComparisonItemDetailHref(
  config: ComparisonConfig,
  item: ComparisonItem
): string {
  const id = item.id;
  switch (config.type) {
    case "cars":
      return `/cars/${id}`;
    case "flights":
      return `/flights/${id}`;
    case "hotels":
      return `/hotels/${id}`;
    default:
      return config.bookingUrl;
  }
}

/** Payment/checkout route for compare CTA (matches BookingSidebar paths). */
export function getComparisonPaymentHref(config: ComparisonConfig): string {
  switch (config.type) {
    case "cars":
      return "/cars/payment";
    case "flights":
      return "/flights/payment";
    case "hotels":
      return "/hotels/payment";
    default:
      return config.bookingUrl;
  }
}

interface GenericComparisonProps {
  items: ComparisonItem[];
  selectedItems: ComparisonItem[];
  config: ComparisonConfig;
  isModalOpen: boolean;
  onToggleItem: (item: ComparisonItem) => void;
  onClearAll: () => void;
  onOpenModal: () => void;
  onCloseModal: () => void;
}

export const useComparison = (maxItems: number = 3) => {
  const [selectedItems, setSelectedItems] = useState<ComparisonItem[]>([]);
  const [showModal, setShowModal] = useState(false);

  const toggleItem = (item: ComparisonItem) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i.id === item.id);
      if (isSelected) {
        return prev.filter(i => i.id !== item.id);
      } else {
        // Limit to maxItems for comparison
        if (prev.length >= maxItems) {
          return [...prev.slice(1), item];
        }
        return [...prev, item];
      }
    });
  };

  const isSelected = (itemId: number) => {
    return selectedItems.some(i => i.id === itemId);
  };

  const clearAll = () => {
    setSelectedItems([]);
    setShowModal(false);
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return {
    selectedItems,
    showModal,
    toggleItem,
    isSelected,
    clearAll,
    openModal,
    closeModal
  };
};

interface ComparisonCheckboxProps {
  isSelected: boolean;
  onToggle: () => void;
  className?: string;
}

export const ComparisonCheckbox: React.FC<ComparisonCheckboxProps> = ({
  isSelected,
  onToggle,
  className = ""
}) => (
  <label className={`flex items-center cursor-pointer ${className}`}>
    <input
      type="checkbox"
      checked={isSelected}
      onChange={onToggle}
      className="w-4 h-4 text-primary rounded focus:ring-ring"
    />
    <span className="ml-1 text-xs text-muted-foreground">Compare</span>
  </label>
);

interface ComparisonButtonProps {
  selectedCount: number;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const ComparisonButton: React.FC<ComparisonButtonProps> = ({
  selectedCount,
  onClick,
  disabled = false,
  className = ""
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center text-primary hover:text-primary-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    <TrendingUp className="mr-2" />
    Compare deals {selectedCount > 0 && `(${selectedCount})`}
  </button>
);

interface FloatingComparisonBarProps {
  selectedItems: ComparisonItem[];
  config: ComparisonConfig;
  onOpenModal: () => void;
  onClearAll: () => void;
}

export const FloatingComparisonBar: React.FC<FloatingComparisonBarProps> = ({
  selectedItems,
  config,
  onOpenModal,
  onClearAll
}) => {
  if (selectedItems.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-primary text-primary-foreground rounded-xl shadow-xl border border-primary/20 p-4 max-w-[95%] md:max-w-sm w-full ">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {config.floatingBarIcon}
          <div>
            <div className="font-semibold">
              {selectedItems.length} {config.type.slice(0, -1)}{selectedItems.length !== 1 ? 's' : ''} selected
            </div>
            <div className="text-xs opacity-90">
              {selectedItems.map(item => item.name).join(', ')}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenModal}
            className="bg-primary-foreground text-primary px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Compare
          </button>
          <button
            onClick={onClearAll}
            className="text-primary-foreground hover:opacity-70 p-1"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface ComparisonModalProps {
  selectedItems: ComparisonItem[];
  config: ComparisonConfig;
  isOpen: boolean;
  onClose: () => void;
  onToggleItem: (item: ComparisonItem) => void;
  onClearAll: () => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  selectedItems,
  config,
  isOpen,
  onClose,
  onToggleItem,
  onClearAll
}) => {
  if (!isOpen || selectedItems.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-card rounded-xl shadow-2xl border border-border max-w-7xl w-full max-h-[90vh] overflow-auto dropdown-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{config.modalTitle} ({selectedItems.length})</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onClearAll}
              className="text-muted-foreground hover:text-foreground px-3 py-1 rounded-lg"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-2 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedItems.map((item) => (
              <div key={item.id} className="bg-muted/50 rounded-xl p-4 border border-border">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Link
                      href={getComparisonItemDetailHref(config, item)}
                      className="group text-left hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                      onClick={onClose}
                    >
                      <h3 className="font-bold text-lg group-hover:underline">
                        {item.name}
                      </h3>
                    </Link>
                    <button
                      onClick={() => onToggleItem(item)}
                      className="text-muted-foreground hover:text-destructive p-1"
                      title="Remove from comparison"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Render item-specific content */}
                {config.renderItem(item)}

                <Link
                  href={getComparisonPaymentHref(config)}
                  onClick={onClose}
                  className="flex w-full items-center justify-center bg-primary hover:bg-primary-600 text-primary-foreground font-semibold py-2 px-4 rounded-lg transition-colors duration-300 mb-3"
                >
                  {config.buttonText}
                </Link>
              </div>
            ))}
          </div>

          {/* Comparison Tips */}
          <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/30">
            <h4 className="font-semibold mb-2">💡 Comparison Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {config.tips.map((tip, index) => (
                <li key={index}>• {tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export const GenericComparison: React.FC<GenericComparisonProps> = ({
  items,
  selectedItems,
  config,
  isModalOpen,
  onToggleItem,
  onClearAll,
  onOpenModal,
  onCloseModal
}) => {
  return (
    <>
      {/* Comparison Modal */}
      <ComparisonModal
        selectedItems={selectedItems}
        config={config}
        isOpen={isModalOpen}
        onClose={onCloseModal}
        onToggleItem={onToggleItem}
        onClearAll={onClearAll}
      />

      {/* Floating Comparison Bar */}
      <div className="relative  sm:p-4">
        <FloatingComparisonBar
        selectedItems={selectedItems}
        config={config}
        onOpenModal={onOpenModal}
        onClearAll={onClearAll}
      />
      </div>
    </>
  );
};

export default GenericComparison;