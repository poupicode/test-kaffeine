import { useAppSelector } from "app/hooks";
import { SettingsCard } from "features/settings/SettingsCard";
import { PageNotFound } from "pages/NotFound/PageNotFound";

export function SettingsPage() {
    const session = useAppSelector((state) => state.session.session);
    return (
        <> 
            {!session ? <PageNotFound/> : <SettingsCard></SettingsCard>}
        </>
    );
}