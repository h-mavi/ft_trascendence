import { api } from '@/router/api/client';
import { useAuthStore } from '@/stores/auth.st';

export async function acceptRequest(id_user)
{
    try{
        await api.patch("/api/friends", { id_friend: id_user });
        useAuthStore().fetchMe(true);
    }
    catch{}
}

export async function rejectRequest(id_user)
{
    try{
        await api.delete("/api/friends", { id_friend: id_user });
        useAuthStore().fetchMe(true);
    }
    catch{}
}

export function rework_date(old_date)
{
    if (!old_date) { return ''; }

    const date = String(old_date).slice(0, 10);
    const [year, month, day] = date.split('-');

	if (!year || !month || !day) { return String(old_date); }

    return `${day}/${month}/${year}`;
}