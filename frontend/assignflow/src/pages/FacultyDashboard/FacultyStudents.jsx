import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Users, 
  UserCircle, 
  ArrowLeft,
  GraduationCap,
  Hash,
  Phone,
  BookOpen
} from 'lucide-react';
import { getFacultyStudents } from '../../api/faculty';
import styles from './FacultyStudents.module.css';

const FacultyStudents = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ groups: [], total_students: 0, total_sections: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Accordion state: track which years and sections are expanded
  const [expandedYears, setExpandedYears] = useState({});
  const [expandedSections, setExpandedSections] = useState({});

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterSection, setFilterSection] = useState('');

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getFacultyStudents();
      setData(result);
      // Auto-expand all years on load
      const yearsOpen = {};
      result.groups.forEach(g => { yearsOpen[g.year] = true; });
      setExpandedYears(yearsOpen);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view students. Complete your faculty profile first.');
      } else {
        setError('Failed to load student data.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const toggleYear = (year) => {
    setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Get all unique years and sections for filter dropdowns
  const availableYears = useMemo(() => data.groups.map(g => g.year), [data]);
  const availableSections = useMemo(() => {
    const set = new Set();
    data.groups.forEach(g => g.sections.forEach(s => set.add(s.section_name)));
    return [...set].sort();
  }, [data]);

  // Apply filters
  const filteredGroups = useMemo(() => {
    let groups = data.groups;

    if (filterYear) {
      groups = groups.filter(g => g.year === parseInt(filterYear));
    }

    return groups.map(yearGroup => {
      let sections = yearGroup.sections;

      if (filterSection) {
        sections = sections.filter(s => s.section_name === filterSection);
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        sections = sections.map(sec => ({
          ...sec,
          students: sec.students.filter(st =>
            st.student_name.toLowerCase().includes(q) ||
            st.student_urn.toLowerCase().includes(q)
          ),
        })).filter(sec => sec.students.length > 0);
      }

      return { ...yearGroup, sections };
    }).filter(g => g.sections.length > 0);
  }, [data, filterYear, filterSection, searchQuery]);

  const filteredTotal = useMemo(() => {
    return filteredGroups.reduce((acc, g) => 
      acc + g.sections.reduce((a, s) => a + s.students.length, 0), 0);
  }, [filteredGroups]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.skeletonLine} style={{ width: '300px', height: '36px' }}></div>
          <div className={styles.skeletonLine} style={{ width: '200px', height: '20px', marginTop: '0.5rem' }}></div>
        </div>
        <div className={styles.skeletonBlock}></div>
        <div className={styles.skeletonBlock}></div>
        <div className={styles.skeletonBlock}></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <button onClick={() => navigate('/faculty-dashboard')} className={styles.backBtn}>
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <h1 className={styles.title}>
            <Users size={28} color="var(--primary-color)" /> My Students
          </h1>
          <p className={styles.subtitle}>
            Viewing <strong>{data.total_students}</strong> students across <strong>{data.total_sections}</strong> sections
          </p>
        </div>
      </motion.div>

      {error && (
        <div className={styles.errorBanner}>{error}</div>
      )}

      {/* Filters Toolbar */}
      <motion.div 
        className={styles.toolbar}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search by name or URN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className={styles.filterSelect} 
          value={filterYear} 
          onChange={(e) => setFilterYear(e.target.value)}
        >
          <option value="">All Years</option>
          {availableYears.map(y => (
            <option key={y} value={y}>Year {y}</option>
          ))}
        </select>
        <select 
          className={styles.filterSelect} 
          value={filterSection} 
          onChange={(e) => setFilterSection(e.target.value)}
        >
          <option value="">All Sections</option>
          {availableSections.map(s => (
            <option key={s} value={s}>Section {s}</option>
          ))}
        </select>
        <div className={styles.resultCount}>
          {filteredTotal} student{filteredTotal !== 1 ? 's' : ''} found
        </div>
      </motion.div>

      {/* Accordion Content */}
      {filteredGroups.length === 0 ? (
        <motion.div 
          className={styles.emptyState}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Users size={48} color="#cbd5e1" />
          <h3>No Students Found</h3>
          <p>
            {data.total_students === 0
              ? 'You are not mapped to any sections yet. Contact your administrator.'
              : 'Try adjusting your search or filters.'}
          </p>
        </motion.div>
      ) : (
        <div className={styles.accordionContainer}>
          {filteredGroups.map((yearGroup, yearIdx) => (
            <motion.div 
              key={yearGroup.year} 
              className={styles.yearBlock}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: yearIdx * 0.1 }}
            >
              {/* Year Header */}
              <button 
                className={styles.yearHeader}
                onClick={() => toggleYear(yearGroup.year)}
              >
                <div className={styles.yearHeaderLeft}>
                  {expandedYears[yearGroup.year] ? <ChevronDown size={22} /> : <ChevronRight size={22} />}
                  <GraduationCap size={22} color="var(--primary-color)" />
                  <span>Year {yearGroup.year}</span>
                </div>
                <span className={styles.yearBadge}>
                  {yearGroup.sections.reduce((a, s) => a + s.students.length, 0)} students
                </span>
              </button>

              {/* Sections */}
              <AnimatePresence>
                {expandedYears[yearGroup.year] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    {yearGroup.sections.map(section => {
                      const sectionKey = `${yearGroup.year}-${section.section_name}`;
                      const isOpen = expandedSections[sectionKey] !== false; // default open

                      return (
                        <div key={sectionKey} className={styles.sectionBlock}>
                          {/* Section Header */}
                          <button
                            className={styles.sectionHeader}
                            onClick={() => toggleSection(sectionKey)}
                          >
                            <div className={styles.sectionHeaderLeft}>
                              {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                              <span>Section {section.section_name}</span>
                              <span className={styles.courseBadge}>{section.course_name}</span>
                            </div>
                            <span className={styles.sectionBadge}>
                              {section.count} student{section.count !== 1 ? 's' : ''}
                            </span>
                          </button>

                          {/* Students Table (Desktop) / Cards (Mobile) */}
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                style={{ overflow: 'hidden' }}
                              >
                                {/* Desktop Table */}
                                <div className={styles.desktopOnly}>
                                  <table className={styles.studentTable}>
                                    <thead>
                                      <tr>
                                        <th>Student</th>
                                        <th>URN</th>
                                        <th>Course / Branch</th>
                                        <th>Year / Sem</th>
                                        <th>Mobile</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {section.students.map(st => (
                                        <tr key={st.id}>
                                          <td>
                                            <div className={styles.studentName}>
                                              {st.student_profile_pic ? (
                                                <img src={st.student_profile_pic} alt="" className={styles.avatar} />
                                              ) : (
                                                <div className={styles.avatarPlaceholder}>
                                                  <UserCircle size={32} color="#94a3b8" />
                                                </div>
                                              )}
                                              <span>{st.student_name}</span>
                                            </div>
                                          </td>
                                          <td><code className={styles.urnCode}>{st.student_urn}</code></td>
                                          <td>{st.student_course} — {st.student_branch}</td>
                                          <td>Y{st.student_year} / S{st.student_sem}</td>
                                          <td>{st.student_mobile || '—'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>

                                {/* Mobile Cards */}
                                <div className={styles.mobileOnly}>
                                  <div className={styles.cardGrid}>
                                    {section.students.map(st => (
                                      <div key={st.id} className={styles.studentCard}>
                                        <div className={styles.cardHeader}>
                                          {st.student_profile_pic ? (
                                            <img src={st.student_profile_pic} alt="" className={styles.cardAvatar} />
                                          ) : (
                                            <div className={styles.cardAvatarPlaceholder}>
                                              <UserCircle size={40} color="#94a3b8" />
                                            </div>
                                          )}
                                          <div>
                                            <div className={styles.cardName}>{st.student_name}</div>
                                            <code className={styles.urnCode}>{st.student_urn}</code>
                                          </div>
                                        </div>
                                        <div className={styles.cardDetails}>
                                          <div><BookOpen size={14} /> {st.student_course} — {st.student_branch}</div>
                                          <div><Hash size={14} /> Year {st.student_year}, Sem {st.student_sem}</div>
                                          {st.student_mobile && <div><Phone size={14} /> {st.student_mobile}</div>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultyStudents;
