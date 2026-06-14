import { Briefcase, GraduationCap, Heart, Home, MapPin } from "lucide-react";

const ProfileIntroCard = ({ profile, onEdit }) => {
  const items = [
    [MapPin, profile.currentCity && `Sống tại ${profile.currentCity}`],
    [Home, profile.hometown && `Đến từ ${profile.hometown}`],
    [Briefcase, profile.work?.company && `${profile.work.position || "Làm việc"} tại ${profile.work.company}`],
    [GraduationCap, profile.education?.school && `Học tại ${profile.education.school}`],
    [Heart, profile.relationshipStatus],
  ].filter(([, value]) => value);

  return (
    <section className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Thông tin cá nhân</h2>
        {profile.isOwner && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onEdit}>
            Chỉnh sửa
          </button>
        )}
      </div>
      {profile.introText && <p className="mt-3 whitespace-pre-wrap text-center">{profile.introText}</p>}
      <div className="mt-4 space-y-3">
        {items.map(([Icon, value]) => (
          <div key={value} className="flex items-start gap-3">
            <Icon className="mt-0.5 size-5 shrink-0 text-base-content/60" />
            <span>{value}</span>
          </div>
        ))}
        {!items.length && !profile.introText && (
          <p className="text-sm text-base-content/55">Chưa có thông tin giới thiệu.</p>
        )}
      </div>
      {!!profile.hobbies?.length && (
        <div className="mt-5 flex flex-wrap gap-2">
          {profile.hobbies.map((hobby) => (
            <span key={hobby} className="badge badge-lg bg-base-200">{hobby}</span>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProfileIntroCard;
