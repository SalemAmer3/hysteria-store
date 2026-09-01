import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    arabic?: string | null;
    hebrew?: string | null;
    image_url?: string | null;
    parent_id?: string | null;
    is_active?: boolean;
}

interface CategoryTreeProps {
    /** All categories (flat list — the component builds the tree internally) */
    categories: Category[];
    /** Currently selected category id */
    activeCategoryId?: string | null;
    /** Text direction */
    direction?: 'ltr' | 'rtl';
    /** Fired when user clicks a category */
    onSelect: (id: string) => void;
    /** Which nodes are expanded (controlled by parent) */
    expandedIds: Record<string, boolean>;
    /** Toggle expand/collapse */
    onToggle: (id: string) => void;
    /** Localize a category name according to the active language */
    getLocalized: (cat: any, field: string) => string;
    /**
     * Variant:
     * - "sidebar" — compact, used in CategoryListing filter panel
     * - "home"    — slightly larger, used on the Home page category grid
     */
    variant?: 'sidebar' | 'home';
}

// ─── helper ──────────────────────────────────────────────────────────────────

/** Returns true if `categoryId` is an ancestor of `activeCategoryId` in the flat list */
function isAncestorOf(
    categoryId: string,
    activeCategoryId: string,
    allCats: Category[],
): boolean {
    const map = Object.fromEntries(allCats.map(c => [c.id, c]));
    let current = map[activeCategoryId];
    while (current?.parent_id) {
        if (current.parent_id === categoryId) return true;
        current = map[current.parent_id];
    }
    return false;
}

// ─── recursive node ───────────────────────────────────────────────────────────

interface NodeProps {
    cat: Category;
    allCats: Category[];
    activeCategoryId?: string | null;
    direction: 'ltr' | 'rtl';
    onSelect: (id: string) => void;
    expandedIds: Record<string, boolean>;
    onToggle: (id: string) => void;
    getLocalized: (cat: any, field: string) => string;
    depth: number;
    variant: 'sidebar' | 'home';
}

const CategoryNode: React.FC<NodeProps> = ({
    cat,
    allCats,
    activeCategoryId,
    direction,
    onSelect,
    expandedIds,
    onToggle,
    getLocalized,
    depth,
    variant,
}) => {
    const children = allCats.filter(c => c.parent_id === cat.id);
    const hasChildren = children.length > 0;
    const isExpanded = !!expandedIds[cat.id];
    const isSelected = activeCategoryId === cat.id;
    const isAncestor = activeCategoryId
        ? isAncestorOf(cat.id, activeCategoryId, allCats)
        : false;
    const isHighlighted = isSelected || isAncestor;

    // ── sizing by depth & variant ──
    const fontSize =
        variant === 'home'
            ? depth === 0 ? 'text-sm' : depth === 1 ? 'text-xs' : 'text-[11px]'
            : depth === 0 ? 'text-xs' : depth === 1 ? 'text-[11px]' : 'text-[10px]';

    const paddingY =
        variant === 'home'
            ? depth === 0 ? 'py-3.5' : 'py-2'
            : depth === 0 ? 'py-2' : 'py-1.5';

    const imgSize =
        depth === 0 ? (variant === 'home' ? 'w-7 h-7' : 'w-4 h-4')
            : depth === 1 ? 'w-5 h-5'
                : 'w-4 h-4';

    // indent per level
    const indentClass =
        depth === 0
            ? ''
            : direction === 'rtl'
                ? `mr-${Math.min(depth * 3, 9)} pr-2 border-r border-zinc-800/60`
                : `ml-${Math.min(depth * 3, 9)} pl-2 border-l border-zinc-800/60`;

    // ── row colours ──
    let rowClass = '';
    if (isSelected) {
        rowClass = 'bg-gold-400 text-black font-extrabold';
    } else if (isHighlighted) {
        rowClass =
            depth === 0
                ? 'bg-gold-400/15 text-gold-400 border border-gold-400/30'
                : 'text-gold-400 font-bold';
    } else {
        rowClass =
            depth === 0
                ? 'text-zinc-300 hover:bg-zinc-900 hover:text-white border border-transparent'
                : depth === 1
                    ? 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200'
                    : 'text-zinc-600 hover:bg-zinc-900/60 hover:text-zinc-300';
    }

    return (
        <div className={indentClass}>
            {/* Row */}
            <div
                className={`flex items-center justify-between rounded-lg transition-all ${depth === 0 && variant === 'home' && !isSelected ? 'border' : ''} ${rowClass}`}
            >
                <button
                    onClick={() => onSelect(cat.id)}
                    className={`flex items-center gap-2 flex-1 px-3 ${paddingY} ${fontSize} font-semibold cursor-pointer`}
                    style={{ textAlign: direction === 'rtl' ? 'right' : 'left' }}
                >
                    {/* arrow indent hint for sub-levels */}
                    {depth > 0 && (
                        <span className={`text-[9px] opacity-50 ${isSelected ? 'text-black' : 'text-zinc-600'}`}>
                            {direction === 'rtl' ? '←' : '→'}
                        </span>
                    )}
                    {cat.image_url && (
                        <img
                            src={cat.image_url}
                            alt=""
                            className={`${imgSize} rounded object-cover flex-shrink-0 ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}
                        />
                    )}
                    <span>{getLocalized(cat, 'name')}</span>
                </button>

                {hasChildren && (
                    <button
                        onClick={() => onToggle(cat.id)}
                        className={`px-2 ${paddingY} cursor-pointer flex-shrink-0 transition-colors ${
                            isSelected ? 'text-black/70' : 'text-zinc-500 hover:text-gold-400'
                        }`}
                    >
                        <ChevronDown
                            size={depth === 0 ? 14 : 11}
                            className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} ${isHighlighted && !isSelected ? 'text-gold-400' : ''}`}
                        />
                    </button>
                )}
            </div>

            {/* Children — animated slide */}
            {hasChildren && (
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded ? 'max-h-[2000px] opacity-100 mt-0.5' : 'max-h-0 opacity-0'
                    }`}
                >
                    <div className="flex flex-col gap-0.5">
                        {children.map(child => (
                            <CategoryNode
                                key={child.id}
                                cat={child}
                                allCats={allCats}
                                activeCategoryId={activeCategoryId}
                                direction={direction}
                                onSelect={onSelect}
                                expandedIds={expandedIds}
                                onToggle={onToggle}
                                getLocalized={getLocalized}
                                depth={depth + 1}
                                variant={variant}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── public component ─────────────────────────────────────────────────────────

export const CategoryTree: React.FC<CategoryTreeProps> = ({
    categories,
    activeCategoryId,
    direction = 'ltr',
    onSelect,
    expandedIds,
    onToggle,
    getLocalized,
    variant = 'sidebar',
}) => {
    const roots = categories.filter(c => !c.parent_id);

    return (
        <div className="flex flex-col gap-0.5">
            {roots.map(cat => (
                <CategoryNode
                    key={cat.id}
                    cat={cat}
                    allCats={categories}
                    activeCategoryId={activeCategoryId}
                    direction={direction}
                    onSelect={onSelect}
                    expandedIds={expandedIds}
                    onToggle={onToggle}
                    getLocalized={getLocalized}
                    depth={0}
                    variant={variant}
                />
            ))}
        </div>
    );
};

/**
 * Collect a category id AND all its descendant ids (any depth).
 * Used for product filtering: if the user selects a parent, show products
 * from all sub-categories beneath it too.
 */
export function collectDescendantIds(
    categoryId: string,
    allCats: { id: string; parent_id?: string | null }[],
): Set<string> {
    const result = new Set<string>();
    const queue = [categoryId];
    while (queue.length) {
        const current = queue.shift()!;
        result.add(current);
        allCats
            .filter(c => c.parent_id === current)
            .forEach(c => queue.push(c.id));
    }
    return result;
}
