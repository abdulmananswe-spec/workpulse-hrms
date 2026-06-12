"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  createBranchAction,
  deleteBranchAction,
  setBranchActiveAction,
  updateBranchAction,
  type BranchFormInput,
} from "@/lib/branches/actions";
import type { Branch } from "@/lib/branches/queries";

const BranchMapLazy = dynamic(
  () => import("@/components/branches/BranchMap").then((module) => module.BranchMap),
  {
    ssr: false,
    loading: () => <Skeleton className="h-56 w-full rounded-none" />,
  },
);

type BranchManagementProps = {
  branches: Branch[];
};

const emptyForm: BranchFormInput = {
  name: "",
  address: "",
  latitude: 0,
  longitude: 0,
  radius_meters: 150,
  is_active: true,
};

export function BranchManagement({ branches }: BranchManagementProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [form, setForm] = useState<BranchFormInput>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported on this device.");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((current) => ({
          ...current,
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
        }));
        setLocationLoading(false);
      },
      () => {
        setError("Unable to retrieve your current location.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15_000 },
    );
  }

  async function searchLocation() {
    const query = searchQuery.trim();
    if (!query) return;

    setLocationLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
        { headers: { Accept: "application/json" } },
      );

      if (!response.ok) {
        throw new Error("Location search failed.");
      }

      const results = (await response.json()) as Array<{
        lat: string;
        lon: string;
        display_name: string;
      }>;

      if (!results.length) {
        setError("No locations found for that search.");
        return;
      }

      const [result] = results;
      setForm((current) => ({
        ...current,
        latitude: Number(Number(result.lat).toFixed(6)),
        longitude: Number(Number(result.lon).toFixed(6)),
        address: current.address?.trim() ? current.address : result.display_name,
      }));
    } catch (searchError) {
      setError(
        searchError instanceof Error ? searchError.message : "Location search failed.",
      );
    } finally {
      setLocationLoading(false);
    }
  }

  function openCreateForm() {
    setEditingBranch(null);
    setForm(emptyForm);
    setError(null);
    setFormOpen(true);
  }

  function openEditForm(branch: Branch) {
    setEditingBranch(branch);
    setForm({
      name: branch.name,
      address: branch.address ?? "",
      latitude: Number(branch.latitude),
      longitude: Number(branch.longitude),
      radius_meters: branch.radius_meters,
      is_active: branch.is_active,
    });
    setError(null);
    setFormOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (editingBranch) {
        await updateBranchAction(editingBranch.id, form);
      } else {
        await createBranchAction(form);
      }

      setFormOpen(false);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save branch.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(branch: Branch) {
    setActionLoadingId(branch.id);

    try {
      await setBranchActiveAction(branch.id, !branch.is_active);
      router.refresh();
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "Unable to update branch status.",
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDelete(branch: Branch) {
    if (
      !window.confirm(
        `Delete branch "${branch.name}"? This cannot be undone if no employees are assigned.`,
      )
    ) {
      return;
    }

    setActionLoadingId(branch.id);

    try {
      await deleteBranchAction(branch.id);
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete branch.",
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openCreateForm}>Add Branch</Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {branches.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center text-muted-foreground">
            No branches configured yet.
          </div>
        ) : (
          branches.map((branch) => (
            <div
              key={branch.id}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md"
            >
              <BranchMapLazy
                latitude={Number(branch.latitude)}
                longitude={Number(branch.longitude)}
                radiusMeters={branch.radius_meters}
                name={branch.name}
              />
              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{branch.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {branch.address ?? "No address provided"}
                    </p>
                  </div>
                  <Badge variant={branch.is_active ? "success" : "danger"}>
                    {branch.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>Radius: {branch.radius_meters}m</span>
                  <span>
                    {Number(branch.latitude).toFixed(4)}, {Number(branch.longitude).toFixed(4)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditForm(branch)}>
                    Edit
                  </Button>
                  <Button
                    variant={branch.is_active ? "destructive" : "secondary"}
                    size="sm"
                    disabled={actionLoadingId === branch.id}
                    onClick={() => void handleToggleActive(branch)}
                  >
                    {branch.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoadingId === branch.id}
                    onClick={() => void handleDelete(branch)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingBranch ? "Edit Branch" : "Add Branch"}
        description="Configure branch location and geofence radius for attendance."
        className="max-w-2xl"
      >
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Branch Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={form.address ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="location_search">Location Search</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="location_search"
                  placeholder="Search city, address, or landmark"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void searchLocation();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={locationLoading}
                  onClick={() => void searchLocation()}
                  className="shrink-0"
                >
                  {locationLoading ? "Searching..." : "Search"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={locationLoading}
                  onClick={useCurrentLocation}
                  className="shrink-0"
                >
                  Use current location
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                value={form.latitude}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    latitude: Number(event.target.value),
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                value={form.longitude}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    longitude: Number(event.target.value),
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="radius_meters">Radius (meters)</Label>
              <Input
                id="radius_meters"
                type="number"
                min={10}
                value={form.radius_meters}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    radius_meters: Number(event.target.value),
                  }))
                }
                required
              />
            </div>
          </div>

          {form.latitude !== 0 && form.longitude !== 0 ? (
            <div className="space-y-2">
              <Label>Geofence preview</Label>
              <div className="overflow-hidden rounded-xl border border-border">
                <BranchMapLazy
                  latitude={form.latitude}
                  longitude={form.longitude}
                  radiusMeters={form.radius_meters}
                  name={form.name || "Branch preview"}
                />
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <input
              id="branch_is_active"
              type="checkbox"
              checked={form.is_active ?? true}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  is_active: event.target.checked,
                }))
              }
            />
            <Label htmlFor="branch_is_active">Active branch</Label>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : editingBranch
                  ? "Save Changes"
                  : "Create Branch"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
