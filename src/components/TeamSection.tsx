import React, { useState } from 'react';
import { Mail, Linkedin, MapPin, Award, ChevronRight, X, ShieldCheck, Wrench, Cpu } from 'lucide-react';
import { TEAM_MEMBERS } from '../data/companyData';
import { TeamMember } from '../types';

interface TeamSectionProps {
  onOpenContact: () => void;
}

export const TeamSection: React.FC<TeamSectionProps> = ({ onOpenContact }) => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  return (
    <section id="team" className="py-24 bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-xs font-bold text-cyan-300 uppercase tracking-widest">
            Leadership & Technical Operations
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Founded by Ryan Young
          </h2>
          <p className="text-slate-400 text-base">
            Combat Veteran & Enrolled Tribal Member operating Spokane's premier precision micro-soldering laboratory and mobile data-secure dispatch.
          </p>
        </div>

        {/* Team Grid */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {TEAM_MEMBERS.map((member) => (
            <div
              key={member.id}
              className="group relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col justify-between"
            >
              {/* Photo */}
              <div className="relative h-72 w-full overflow-hidden bg-slate-900">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                {/* Location Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-[11px] font-medium text-slate-300 border border-slate-800">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  <span>{member.location}</span>
                </div>
              </div>

              {/* Bio Details */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-xs font-semibold text-cyan-400">{member.role}</p>
                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    {member.bio}
                  </p>
                </div>

                {/* Expertise Badges */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                  {member.expertise.map((exp, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded text-[10px] font-mono bg-slate-900 text-amber-300 border border-slate-800">
                      {exp}
                    </span>
                  ))}
                </div>

                {/* Direct Action */}
                <div className="pt-3 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedMember(member)}
                    className="text-xs font-bold text-slate-300 hover:text-cyan-400 flex items-center gap-1"
                  >
                    Full Bio & Credentials <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    {member.linkedInUrl && (
                      <a
                        href={member.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-slate-900 text-cyan-400 hover:bg-slate-800 hover:text-cyan-300 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        title="Connect on LinkedIn"
                      >
                        <Linkedin className="w-3.5 h-3.5" /> Connect
                      </a>
                    )}
                    <button
                      onClick={onOpenContact}
                      className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title={`Contact ${member.name}`}
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Team Member Bio Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <img
                src={selectedMember.photo}
                alt={selectedMember.name}
                className="w-16 h-16 rounded-xl object-cover object-top border border-slate-700"
              />
              <div>
                <h3 className="text-xl font-bold text-white">{selectedMember.name}</h3>
                <p className="text-xs font-semibold text-cyan-400">{selectedMember.role}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3 h-3 text-cyan-400" /> {selectedMember.location}
                </div>
              </div>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Executive Summary</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedMember.bio}
                </p>
              </div>

              {selectedMember.technicalBiography && (
                <div className="space-y-2 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5 text-cyan-400" /> Technical Biography & Career Progression
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {selectedMember.technicalBiography}
                  </p>
                </div>
              )}

              {selectedMember.militaryService && (
                <div className="space-y-2 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Military Service & Deployment
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {selectedMember.militaryService}
                  </p>
                </div>
              )}

              {selectedMember.education && (
                <div className="space-y-2 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-emerald-400" /> Academic Background
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {selectedMember.education}
                  </p>
                </div>
              )}

              {selectedMember.researchExperience && (
                <div className="space-y-2 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5 text-blue-400" /> NASA & Aerospace R&D Experience
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {selectedMember.researchExperience}
                  </p>
                </div>
              )}

              {selectedMember.seattleExperience && (
                <div className="space-y-2 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Seattle IT Contracting, Car Toys & Web Development (2015)
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {selectedMember.seattleExperience}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Specializations & Certifications</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.expertise.map((exp, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-950 text-cyan-300 border border-slate-800">
                      {exp}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-800">
              <div className="text-xs text-slate-400 font-mono">
                {selectedMember.email}
              </div>
              <div className="flex items-center gap-2">
                {selectedMember.linkedInUrl && (
                  <a
                    href={selectedMember.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg bg-slate-800 text-cyan-400 hover:bg-slate-700 hover:text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" /> Connect on LinkedIn
                  </a>
                )}
                <button
                  onClick={() => {
                    setSelectedMember(null);
                    onOpenContact();
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
                >
                  Schedule Direct Consultation
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
