"use client";

import {
  Loader2,
  Mail,
  Pencil,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import ConfirmDialog from "@/src/components/ui/ConfirmDialog";
import {
  useCreateEditorialCategory,
  useCreateEditorialMember,
  useDeleteEditorialCategory,
  useDeleteEditorialMember,
  useGetEditorialBoard,
  useUpdateEditorialCategory,
  useUpdateEditorialMember,
} from "@/src/hooks";
import { toastError, toastSuccess } from "@/src/lib/toast";
import type {
  EditorialBoardCategory,
  EditorialBoardMember,
} from "@/src/types/editorialBoard";

const fieldClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 transition-colors duration-300 focus:border-[#036eb6] focus:outline-none focus:ring-2 focus:ring-[#036eb6]/20";

const labelClassName = "mb-1.5 block text-sm font-semibold text-[#092151]";

type CategoryFormProps = {
  initialTitle?: string;
  initialSortOrder?: number;
  submitLabel: string;
  isLoading: boolean;
  onSubmit: (values: { title: string; sortOrder: number }) => Promise<void>;
  onCancel?: () => void;
};

function CategoryForm({
  initialTitle = "",
  initialSortOrder = 0,
  submitLabel,
  isLoading,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [sortOrder, setSortOrder] = useState(String(initialSortOrder));

  useEffect(() => {
    setTitle(initialTitle);
    setSortOrder(String(initialSortOrder));
  }, [initialTitle, initialSortOrder]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      toastError("Category title is required.");
      return;
    }

    await onSubmit({
      title: title.trim(),
      sortOrder: Number(sortOrder) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClassName} htmlFor="category-title">
          Category title
        </label>
        <input
          id="category-title"
          className={fieldClassName}
          placeholder="e.g. Associate Editors"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>
      <div>
        <label className={labelClassName} htmlFor="category-sort">
          Display order
        </label>
        <input
          id="category-sort"
          type="number"
          className={fieldClassName}
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg bg-[#036eb6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#024081] disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
};

type MemberFormProps = {
  categoryId: string;
  initial?: EditorialBoardMember | null;
  onSaved: () => void;
  onCancel?: () => void;
};

function MemberForm({ categoryId, initial, onSaved, onCancel }: MemberFormProps) {
  const createMember = useCreateEditorialMember();
  const updateMember = useUpdateEditorialMember();

  const [name, setName] = useState(initial?.name ?? "");
  const [designation, setDesignation] = useState(initial?.designation ?? "");
  const [affiliation, setAffiliation] = useState(initial?.affiliation ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));

  useEffect(() => {
    setName(initial?.name ?? "");
    setDesignation(initial?.designation ?? "");
    setAffiliation(initial?.affiliation ?? "");
    setEmail(initial?.email ?? "");
    setSortOrder(String(initial?.sortOrder ?? 0));
  }, [initial]);

  const isLoading = createMember.isPending || updateMember.isPending;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      toastError("Member name is required.");
      return;
    }

    try {
      if (initial) {
        await updateMember.mutateAsync({
          memberId: initial._id,
          categoryId,
          name: name.trim(),
          designation: designation.trim(),
          affiliation: affiliation.trim(),
          email: email.trim(),
          sortOrder: Number(sortOrder) || 0,
        });
        toastSuccess("Member updated.");
      } else {
        await createMember.mutateAsync({
          categoryId,
          name: name.trim(),
          designation: designation.trim(),
          affiliation: affiliation.trim(),
          email: email.trim(),
          sortOrder: Number(sortOrder) || 0,
        });
        toastSuccess("Member added.");
      }
      onSaved();
    } catch (error) {
      toastError(error instanceof Error ? error.message : "Failed to save member.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
      <p className="text-sm font-semibold text-[#092151]">
        {initial ? "Edit member" : "Add board member"}
      </p>
      <div>
        <label className={labelClassName} htmlFor="member-name">
          Name
        </label>
        <input
          id="member-name"
          className={fieldClassName}
          placeholder="Dr. Jane Doe, Ph.D"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div>
        <label className={labelClassName} htmlFor="member-designation">
          Designation / role
        </label>
        <input
          id="member-designation"
          className={fieldClassName}
          placeholder="Associate Professor, Mechanical Engineering"
          value={designation}
          onChange={(event) => setDesignation(event.target.value)}
        />
      </div>
      <div>
        <label className={labelClassName} htmlFor="member-affiliation">
          Affiliation
        </label>
        <textarea
          id="member-affiliation"
          rows={3}
          className={fieldClassName}
          placeholder="Institution, city, country (one line or multiple lines)"
          value={affiliation}
          onChange={(event) => setAffiliation(event.target.value)}
        />
      </div>
      <div>
        <label className={labelClassName} htmlFor="member-email">
          Email (optional)
        </label>
        <input
          id="member-email"
          type="email"
          className={fieldClassName}
          placeholder="editor@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div>
        <label className={labelClassName} htmlFor="member-sort">
          Display order
        </label>
        <input
          id="member-sort"
          type="number"
          className={fieldClassName}
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg bg-[#036eb6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#024081] disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {initial ? "Save changes" : "Add member"}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

function BoardPreview({ categories }: { categories: EditorialBoardCategory[] }) {
  if (categories.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No categories yet. Create a category (e.g. Editor-in-Chief, Associate Editors) and add
        members to preview the public editorial board page.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {categories.map((category) => (
        <section key={category._id}>
          <h3 className="border-b border-[#036eb6]/30 pb-2 text-lg font-bold uppercase tracking-wide text-[#092151]">
            {category.title}
          </h3>
          {category.members.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No members in this category.</p>
          ) : (
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {category.members.map((member) => (
                <li
                  key={member._id}
                  className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <p className="font-semibold text-[#092151]">{member.name}</p>
                  {member.designation ? (
                    <p className="mt-1 text-sm text-slate-700">{member.designation}</p>
                  ) : null}
                  {member.affiliation ? (
                    <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
                      {member.affiliation}
                    </p>
                  ) : null}
                  {member.email ? (
                    <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-[#036eb6]">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      {member.email}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

export default function EditorialBoardManager() {
  const { data: board = [], isLoading } = useGetEditorialBoard();
  const createCategory = useCreateEditorialCategory();
  const updateCategory = useUpdateEditorialCategory();
  const deleteCategory = useDeleteEditorialCategory();
  const deleteMember = useDeleteEditorialMember();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<EditorialBoardCategory | null>(null);
  const [editingMember, setEditingMember] = useState<EditorialBoardMember | null>(null);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<EditorialBoardCategory | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<EditorialBoardMember | null>(null);

  const sortedBoard = useMemo(
    () =>
      [...board].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title),
      ),
    [board],
  );

  const selectedCategory = sortedBoard.find(
    (category) => category._id === selectedCategoryId,
  );

  useEffect(() => {
    if (!selectedCategoryId && sortedBoard.length > 0) {
      setSelectedCategoryId(sortedBoard[0]!._id);
    }
  }, [selectedCategoryId, sortedBoard]);

  const handleCreateCategory = async (values: { title: string; sortOrder: number }) => {
    try {
      const created = await createCategory.mutateAsync(values);
      toastSuccess("Category created.");
      setSelectedCategoryId(created._id);
      setEditingCategory(null);
    } catch (error) {
      toastError(error instanceof Error ? error.message : "Failed to create category.");
    }
  };

  const handleUpdateCategory = async (values: { title: string; sortOrder: number }) => {
    if (!editingCategory) return;

    try {
      await updateCategory.mutateAsync({
        categoryId: editingCategory._id,
        ...values,
      });
      toastSuccess("Category updated.");
      setEditingCategory(null);
    } catch (error) {
      toastError(error instanceof Error ? error.message : "Failed to update category.");
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory.mutateAsync({ categoryId: categoryToDelete._id });
      toastSuccess("Category deleted.");
      if (selectedCategoryId === categoryToDelete._id) {
        setSelectedCategoryId(null);
      }
      setCategoryToDelete(null);
    } catch (error) {
      toastError(error instanceof Error ? error.message : "Failed to delete category.");
    }
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      await deleteMember.mutateAsync({ memberId: memberToDelete._id });
      toastSuccess("Member deleted.");
      setMemberToDelete(null);
    } catch (error) {
      toastError(error instanceof Error ? error.message : "Failed to delete member.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-[#036eb6]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,360px)_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Plus className="h-5 w-5 text-[#036eb6]" />
            <h2 className="text-lg font-bold text-[#092151]">Editor categories</h2>
          </div>

          {editingCategory ? (
            <CategoryForm
              key={editingCategory._id}
              initialTitle={editingCategory.title}
              initialSortOrder={editingCategory.sortOrder}
              submitLabel="Save category"
              isLoading={updateCategory.isPending}
              onSubmit={handleUpdateCategory}
              onCancel={() => setEditingCategory(null)}
            />
          ) : (
            <CategoryForm
              submitLabel="Create category"
              isLoading={createCategory.isPending}
              onSubmit={handleCreateCategory}
            />
          )}

          <ul className="mt-8 space-y-2">
            {sortedBoard.map((category) => {
              const isActive = category._id === selectedCategoryId;
              return (
                <li key={category._id}>
                  <div
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition ${
                      isActive
                        ? "border-[#036eb6]/40 bg-blue-50/80"
                        : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(category._id);
                        setEditingMember(null);
                        setShowMemberForm(false);
                      }}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate font-semibold text-[#092151]">{category.title}</p>
                      <p className="text-xs text-slate-500">
                        Order {category.sortOrder} · {category.members.length} member
                        {category.members.length === 1 ? "" : "s"}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCategory(category)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-[#036eb6]"
                      aria-label={`Edit ${category.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryToDelete(category)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-red-600"
                      aria-label={`Delete ${category.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-[#036eb6]" />
              <h2 className="text-lg font-bold text-[#092151]">
                {selectedCategory ? selectedCategory.title : "Board members"}
              </h2>
            </div>
            {selectedCategory ? (
              <button
                type="button"
                onClick={() => {
                  setEditingMember(null);
                  setShowMemberForm(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-[#036eb6]/30 bg-blue-50 px-3 py-2 text-sm font-semibold text-[#024081] hover:bg-blue-100"
              >
                <Plus className="h-4 w-4" />
                Add member
              </button>
            ) : null}
          </div>

          {!selectedCategory ? (
            <p className="text-sm text-slate-500">
              Create an editor category first, then add members with name, role, affiliation, and
              email.
            </p>
          ) : (
            <div className="space-y-6">
              {(showMemberForm || editingMember) && selectedCategory ? (
                <MemberForm
                  key={editingMember?._id ?? "new"}
                  categoryId={selectedCategory._id}
                  initial={editingMember}
                  onSaved={() => {
                    setEditingMember(null);
                    setShowMemberForm(false);
                  }}
                  onCancel={() => {
                    setEditingMember(null);
                    setShowMemberForm(false);
                  }}
                />
              ) : null}

              {selectedCategory.members.length === 0 && !showMemberForm ? (
                <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                  No members yet. Click &quot;Add member&quot; to add the first person in this
                  category.
                </p>
              ) : (
                <ul className="space-y-3">
                  {[...selectedCategory.members]
                    .sort(
                      (a, b) =>
                        a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
                    )
                    .map((member) => (
                      <li
                        key={member._id}
                        className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-[#092151]">{member.name}</p>
                          {member.designation ? (
                            <p className="mt-1 text-sm text-slate-700">{member.designation}</p>
                          ) : null}
                          {member.affiliation ? (
                            <p className="mt-1 whitespace-pre-line text-sm text-slate-600">
                              {member.affiliation}
                            </p>
                          ) : null}
                          {member.email ? (
                            <p className="mt-2 text-sm text-[#036eb6]">{member.email}</p>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowMemberForm(false);
                              setEditingMember(member);
                            }}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setMemberToDelete(member)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-bold text-[#092151]">Public page preview</h2>
        <BoardPreview categories={sortedBoard} />
      </section>

      <ConfirmDialog
        open={Boolean(categoryToDelete)}
        title="Delete category"
        message={`Delete "${categoryToDelete?.title}" and all members in this category? This cannot be undone.`}
        confirmLabel="Delete category"
        isLoading={deleteCategory.isPending}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={confirmDeleteCategory}
      />

      <ConfirmDialog
        open={Boolean(memberToDelete)}
        title="Delete member"
        message={`Remove ${memberToDelete?.name} from the editorial board?`}
        confirmLabel="Delete member"
        isLoading={deleteMember.isPending}
        onClose={() => setMemberToDelete(null)}
        onConfirm={confirmDeleteMember}
      />
    </div>
  );
}
