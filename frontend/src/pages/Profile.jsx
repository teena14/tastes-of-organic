import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import {
    User, Mail, Phone, Calendar, MapPin, Home, Globe,
    CheckCircle, Edit3, Save, X, Camera
} from "lucide-react";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* ─── Single inline-editable field ─────────────────────────────── */
const InlineField = ({ icon: Icon, label, name, value, type = "text", options, onSave }) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const inputRef = useRef(null);

    // Sync draft when parent value changes (e.g. initial load)
    useEffect(() => { if (!editing) setDraft(value); }, [value, editing]);

    const startEdit = () => { setDraft(value); setEditing(true); setTimeout(() => inputRef.current?.focus(), 50); };
    const cancel = () => { setDraft(value); setEditing(false); };
    const save = () => { onSave(name, draft); setEditing(false); };

    const handleKey = (e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") cancel();
    };

    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400" style={{ fontFamily: "Poppins, sans-serif" }}>
                {label}
            </label>
            <div
                className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all"
                style={{
                    background: editing ? "#F0F7EB" : "#FAFAFA",
                    border: editing ? "1.5px solid #1B5E20" : "1.5px solid #EBEBEB",
                }}
            >
                <Icon size={15} style={{ color: "#1B5E20", flexShrink: 0 }} />

                {/* Value / Input */}
                <div className="flex-1 min-w-0">
                    {options ? (
                        <select
                            ref={inputRef}
                            name={name}
                            value={draft}
                            disabled={!editing}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={handleKey}
                            className="w-full bg-transparent outline-none text-sm text-gray-700 disabled:text-gray-500"
                            style={{ fontFamily: "Poppins, sans-serif", cursor: editing ? "pointer" : "default" }}
                        >
                            {options.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                    ) : (
                        <input
                            ref={inputRef}
                            type={type}
                            name={name}
                            value={draft}
                            readOnly={!editing}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder={editing ? `Enter ${label.toLowerCase()}` : "—"}
                            className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-300"
                            style={{ fontFamily: "Poppins, sans-serif", cursor: editing ? "text" : "default" }}
                        />
                    )}
                </div>

                {/* Edit / Save / Cancel icons */}
                {editing ? (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                            onClick={save}
                            className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                            style={{ background: "#1B5E20" }}
                            title="Save"
                        >
                            <Save size={11} color="#fff" />
                        </button>
                        <button
                            onClick={cancel}
                            className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                            style={{ background: "#EEE" }}
                            title="Cancel"
                        >
                            <X size={11} color="#555" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={startEdit}
                        className="flex-shrink-0 hover:opacity-70 transition-opacity"
                        title={`Edit ${label}`}
                    >
                        <Edit3 size={13} style={{ color: "#AAAAAA" }} />
                    </button>
                )}
            </div>
        </div>
    );
};

/* ─── Main Profile page ─────────────────────────────────────────── */
const Profile = () => {
    const { user } = useSelector((s) => s.auth);

    const init = {
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        dob: "",
        gender: "Prefer not to say",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
    };

    const [profile, setProfile] = useState(init);

    // Photo state
    const [photoSrc, setPhotoSrc] = useState(null);      // committed photo
    const [pendingSrc, setPendingSrc] = useState(null);   // chosen but not confirmed
    const [photoMode, setPhotoMode] = useState(false);    // is picker UI open?
    const fileInputRef = useRef(null);

    // Load profile from backend
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_BASE}/profile`, { credentials: "include" });
                if (res.ok) {
                    const data = await res.json();
                    setProfile((prev) => ({ ...prev, ...data }));
                }
            } catch { /* silently fail */ }
        };
        fetchProfile();
    }, []);

    // Per-field save handler
    const handleSave = async (field, value) => {
        const updated = { ...profile, [field]: value };
        setProfile(updated);
        try {
            await fetch(`${API_BASE}/profile`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated),
            });
        } catch { /* offline-friendly */ }
        toast.success(`${field === "addressLine1" ? "Address" : field.charAt(0).toUpperCase() + field.slice(1)} updated`);
    };

    // Photo handling
    const handleCameraClick = () => {
        setPhotoMode(true);
        setPendingSrc(null);
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) { setPhotoMode(false); return; }
        const reader = new FileReader();
        reader.onload = (ev) => setPendingSrc(ev.target.result);
        reader.readAsDataURL(file);
        // reset so same file triggers onChange again
        e.target.value = "";
    };

    const confirmPhoto = () => { setPhotoSrc(pendingSrc); setPendingSrc(null); setPhotoMode(false); };
    const cancelPhoto = () => { setPendingSrc(null); setPhotoMode(false); };

    const initials = profile.name
        ? profile.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
        : "?";

    return (
        <div
            className="min-h-screen"
            style={{ background: "linear-gradient(135deg,#F0F7EB 0%,#FAF9F5 60%,#E8F5E9 100%)", fontFamily: "Poppins, sans-serif" }}
        >
            {/* ── Hero banner ─────────────────────────────────── */}
            <div
                className="relative flex flex-col items-center pt-16 pb-32"
                style={{ background: "linear-gradient(135deg,#1B5E20 0%,#2E7D32 50%,#388E3C 100%)" }}
            >
                {/* Decorative circles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-10 -left-10 w-72 h-72 rounded-full opacity-10" style={{ background: "#fff" }} />
                    <div className="absolute bottom-0 right-0 w-96 h-48 rounded-full opacity-10" style={{ background: "#fff" }} />
                </div>

                {/* Avatar + camera button */}
                <div className="relative">
                    <div
                        className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl overflow-hidden"
                        style={{ background: "linear-gradient(135deg,#F0F7EB,#C8E6C9)", border: "4px solid rgba(255,255,255,0.4)" }}
                    >
                        {photoSrc ? (
                            <img src={photoSrc} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl font-bold" style={{ color: "#1B5E20" }}>{initials}</span>
                        )}
                    </div>

                    {/* Camera / change-photo button */}
                    <button
                        onClick={handleCameraClick}
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                        style={{ background: "#fff" }}
                        title="Change profile photo"
                    >
                        <Camera size={14} style={{ color: "#1B5E20" }} />
                    </button>

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>

                {/* Only name — no email */}
                <h1 className="mt-5 text-2xl font-bold text-white tracking-wide">
                    {profile.name || "Your Profile"}
                </h1>
            </div>

            {/* ── Photo preview modal ─────────────────────────── */}
            {photoMode && pendingSrc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
                    <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-6 shadow-2xl max-w-sm w-full">
                        <p className="text-base font-semibold text-gray-700">Use this photo?</p>
                        <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg border-4" style={{ borderColor: "#C8E6C9" }}>
                            <img src={pendingSrc} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={cancelPhoto}
                                className="flex-1 py-2.5 rounded-full border text-sm font-medium transition-all hover:bg-gray-50"
                                style={{ borderColor: "#ccc", color: "#555" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmPhoto}
                                className="flex-1 py-2.5 rounded-full text-sm font-medium text-white transition-all active:scale-95"
                                style={{ background: "#1B5E20" }}
                            >
                                Use Photo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Profile card ─────────────────────────────────── */}
            <div className="max-w-2xl mx-auto px-4 -mt-20 pb-16">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="px-8 pt-8 pb-2">
                        <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Click the pencil icon on any field to edit it</p>
                    </div>

                    <div className="px-8 pb-8 grid gap-5 mt-4">
                        <hr style={{ borderColor: "#F0F0F0" }} />
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest -mb-2">Basic Info</p>

                        <InlineField icon={User}     label="Full Name"       name="name"     value={profile.name}   onSave={handleSave} />
                        <InlineField icon={Mail}     label="Email Address"   name="email"    value={profile.email}  type="email" onSave={handleSave} />

                        <div className="grid grid-cols-2 gap-4">
                            <InlineField icon={Phone}    label="Phone Number"    name="phone" value={profile.phone} type="tel"  onSave={handleSave} />
                            <InlineField icon={Calendar} label="Date of Birth"   name="dob"   value={profile.dob}   type="date" onSave={handleSave} />
                        </div>

                        <InlineField
                            icon={User} label="Gender" name="gender" value={profile.gender} onSave={handleSave}
                            options={["Male", "Female", "Non-binary", "Prefer not to say"]}
                        />

                        <hr style={{ borderColor: "#F0F0F0" }} />
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest -mb-2">Address</p>

                        <InlineField icon={Home}    label="Address Line 1" name="addressLine1" value={profile.addressLine1} onSave={handleSave} />
                        <InlineField icon={MapPin}  label="Address Line 2" name="addressLine2" value={profile.addressLine2} onSave={handleSave} />

                        <div className="grid grid-cols-3 gap-4">
                            <InlineField icon={MapPin}       label="City"    name="city"    value={profile.city}    onSave={handleSave} />
                            <InlineField icon={MapPin}       label="State"   name="state"   value={profile.state}   onSave={handleSave} />
                            <InlineField icon={CheckCircle}  label="Pincode" name="pincode" value={profile.pincode} onSave={handleSave} />
                        </div>

                        <InlineField icon={Globe} label="Country" name="country" value={profile.country} onSave={handleSave} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
