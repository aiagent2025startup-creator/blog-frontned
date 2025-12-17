import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";

export default function Settings() {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Prefill with user context data
    setName(user.name || "");
    setEmail(user.email || "");
    setBio(user.bio || "");
    setAvatarPreview(user.avatar || null);
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setAvatarFile(f);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(f);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update profile data (simple PUT to profile update endpoint)
      const res = await fetch(`http://localhost:5000/api/profiles/${user.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: name,
          bio,
        })
      });
      // Try to parse JSON; if response is HTML (doctype) or plain text, fallback to text
      let json: any = null;
      try {
        json = await res.json();
      } catch (err) {
        const text = await res.text();
        // If server returned HTML starting with '<!DOCTYPE' or '<html', use the text as message
        if (!res.ok) throw new Error(text || 'Failed to update profile');
      }

      if (!res.ok) {
        const message = (json && json.message) || 'Failed to update profile';
        throw new Error(message);
      }

      // If avatar file chosen, upload via multipart endpoint
      if (avatarFile) {
        const fd = new FormData();
        // Backend expects field name 'profilePicture' per upload middleware
        fd.append('profilePicture', avatarFile);
        const up = await fetch(`http://localhost:5000/api/profiles/${user.id}/picture`, {
          method: 'POST',
          credentials: 'include',
          body: fd,
        });
        let upJson: any = null;
        try {
          upJson = await up.json();
        } catch (err) {
          const t = await up.text();
          if (!up.ok) throw new Error(t || 'Failed to upload avatar');
        }
        if (!up.ok) throw new Error((upJson && upJson.message) || 'Failed to upload avatar');
      }

      toast({ title: 'Saved', description: 'Profile settings updated.' });
      // Update user context globally so changes sync across app
      updateUser({
        name: name,
        bio: bio,
        avatar: avatarPreview || user.avatar,
      });
      // Redirect back to profile
      setTimeout(() => navigate(`/profile/${user.id}`), 600);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Save failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="font-display text-2xl font-bold mb-6">Settings</h1>

        <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {avatarPreview ? (
                <AvatarImage src={avatarPreview} />
              ) : (
                <AvatarFallback>{(name || 'U').charAt(0)}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <Label>Change Avatar</Label>
              <input type="file" accept="image/*" onChange={handleAvatarChange} />
            </div>
          </div>

          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <Label>Email</Label>
            <Input value={email} disabled />
          </div>

          <div>
            <Label>Bio</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>

          <div className="flex items-center justify-end">
            <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="ml-2">{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
