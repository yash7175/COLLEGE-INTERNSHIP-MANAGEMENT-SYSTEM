import React, { useState, useEffect } from 'react';
import { Award, User, Star, Building, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { Evaluation } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const FacultyEvaluationsPage: React.FC = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const res = await api.get('/evaluations');
        if (res.data?.success) {
          setEvaluations(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluations();
  }, []);

  if (loading) return <LoadingSpinner fullPage message="Loading student evaluations..." />;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Student Performance Evaluations
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review 6-point competency evaluations recorded for student internship candidates.
        </p>
      </div>

      {evaluations.length === 0 ? (
        <EmptyState
          title="No evaluations submitted yet"
          description="Go to Applications to evaluate candidates who have interviewed."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {evaluations.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {ev.application?.student.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    {ev.application?.internship.title}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xl font-extrabold text-brand-600 font-['Outfit']">
                    {ev.overallRating.toFixed(1)} / 5.0
                  </span>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Overall Score
                  </span>
                </div>
              </div>

              {/* 6 Criteria Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Technical</span>
                  <span className="font-bold text-slate-800">{ev.technicalSkills} / 5</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Soft Skills</span>
                  <span className="font-bold text-slate-800">{ev.softSkills} / 5</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Punctuality</span>
                  <span className="font-bold text-slate-800">{ev.punctuality} / 5</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Responsibility</span>
                  <span className="font-bold text-slate-800">{ev.responsibility} / 5</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Teamwork</span>
                  <span className="font-bold text-slate-800">{ev.teamwork} / 5</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Learning</span>
                  <span className="font-bold text-slate-800">{ev.learningAbility} / 5</span>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-600 bg-brand-50/50 p-3 rounded-2xl border border-brand-100/60">
                <span className="font-bold text-brand-900 block mb-1">Evaluator Comments:</span>
                <p className="italic">"{ev.comments}"</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
