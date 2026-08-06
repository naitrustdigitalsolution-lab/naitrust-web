/**
 * AgreementDocument
 * Renders a deal agreement as a numbered-clause document panel with an
 * AI-drafted (advisory) badge. Shared by the create-deal wizard's agreement
 * step and the invitation accept flow.
 *
 * With `editable` + `onChange`, each clause body becomes editable so the
 * creator can adjust the AI wording before sending (agreement editing is only
 * offered while creating a deal or when renegotiating: guardrails).
 */

import { ChevronDown, FileText, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../../ui/badge';
import { Textarea } from '../../ui/textarea';
import type { AgreementDraft } from '../../../libs/store/types';

interface AgreementDocumentProps {
  agreement: AgreementDraft;
  /** Constrain height and scroll internally (used inside dense flows). */
  scrollable?: boolean;
  /** When true, clause bodies are editable via `onChange`. */
  editable?: boolean;
  /** Hide the AI-drafted note (e.g. on an already-agreed deal being viewed). */
  hideAiNote?: boolean;
  /** Show a short preview first, with a control to reveal every clause. */
  collapsible?: boolean;
  onChange?: (next: AgreementDraft) => void;
}

export function AgreementDocument({
  agreement,
  scrollable = false,
  editable = false,
  hideAiNote = false,
  collapsible = false,
  onChange,
}: AgreementDocumentProps) {
  const [expanded, setExpanded] = useState(!collapsible);
  const editBody = (index: number, body: string) => {
    if (!onChange) return;
    onChange({
      ...agreement,
      sections: agreement.sections.map((s, i) => (i === index ? { ...s, body } : s)),
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-primary" />
          <p className="text-sm font-semibold text-foreground">Protected Deal agreement</p>
          <span className="text-xs text-muted-foreground">v{agreement.version}</span>
        </div>
        <div className="flex items-center gap-2">{agreement.generatedByAi && !hideAiNote && (
          <Badge variant="outline" className="gap-1 text-xs">
            <Sparkles size={12} className="text-primary" />
            {editable ? 'AI-drafted · editable' : 'AI-drafted · review before accepting'}
          </Badge>
        )}{collapsible && <button type="button" onClick={() => setExpanded((current) => !current)} className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-primary transition hover:bg-primary/10">{expanded ? 'Show less' : 'View full agreement'}<ChevronDown size={14} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} /></button>}</div>
      </div>
      <ol className={`space-y-4 px-4 py-4 ${scrollable ? 'max-h-72 overflow-y-auto' : ''}`}>
        {(expanded ? agreement.sections : agreement.sections.slice(0, 2)).map((section, i) => (
          <li key={section.heading} className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{section.heading}</p>
              {editable ? (
                <Textarea
                  className="mt-1.5 text-sm"
                  rows={3}
                  value={section.body}
                  onChange={(e) => editBody(i, e.target.value)}
                />
              ) : (
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{section.body}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
      {collapsible && !expanded && agreement.sections.length > 2 && <button type="button" onClick={() => setExpanded(true)} className="flex w-full items-center justify-center gap-1.5 border-t bg-muted/20 px-4 py-3 text-xs font-semibold text-primary hover:bg-muted/40">View all {agreement.sections.length} clauses<ChevronDown size={14} /></button>}
    </div>
  );
}
