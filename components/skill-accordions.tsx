import React from 'react';
import { Plus } from 'lucide-react';
import type { Category, Skill } from '../lib/types';
export function SkillAccordions({ categories, skills }: { categories: Category[]; skills: Skill[] }) {
  return <div className="accordion-list">{categories.filter(c => skills.some(s => s.category_id === c.id)).map((category, i) => <details className="skill-accordion" key={category.id}><summary><span className="mono accordion-index">{String(i + 1).padStart(2, '0')}</span><h3>{category.name}</h3><Plus className="accordion-plus" size={22} /></summary><ul>{skills.filter(s => s.category_id === category.id).map(skill => <li key={skill.id}>{skill.name}</li>)}</ul></details>)}</div>;
}
