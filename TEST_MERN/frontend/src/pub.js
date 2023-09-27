import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import "./App.css";

function generateBib(pub) {
    const topics = Array.isArray(pub.topic) ? pub.topic : [pub.topic];
    const formattedTopics = topics.map(topic => `"${topic}"`).join(', ');
    return `@publication{${pub._id},
    TITLE = {${pub.title}},
    AUTHOR = {${pub.authors}},
    YEAR = {${pub.year}},
    TYPE = {${pub.type}},
    TOPIC = {${formattedTopics}}
  }`;
}

function handleBibDownload(pub) {
    const blob = new Blob([generateBib(pub)], { type: "text/plain;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `${pub.title}.bib`; // Name of the downloaded file
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
  

function Pub() {
  const [publications, setPublications] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSmallScreen, setisSmallScreen] = useState(window.innerWidth < 768);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([
    { value: "", label: "All" }
  ]);
  const topicOptions = [
    { value: "", label: "All" }, 
    { value: "Counterfactuals", label: "Counterfactuals" },
    { value: "Culture", label: "Culture" },
    { value: "Education", label: "Education" },
    { value: "Environment", label: "Environment" },
    { value: "Fairness In AI", label: "Fairness In AI" },
    { value: "FMRI", label: "FMRI" },
    { value: "Geo-spatial", label: "Geo-spatial" },
    { value: "Hate", label: "Hate" },
    { value: "Language", label: "Language" },
    { value: "Method", label: "Method" },
    { value: "Modeling", label: "Modeling" },
    { value: "Morality", label: "Morality" },
    { value: "Politics", label: "Politics" },
    { value: "Social Networks", label: "Social Networks" },
    { value: "Virtual Humans", label: "Virtual Humans" },
  ];

  useEffect(() => {
    axios.get('https://publicationmolalab.wl.r.appspot.com/posts/list')
      .then(response => {
        setPublications(response.data.data);
      })
      .catch(error => {
        console.error('Error fetching publications:', error);
      });
    function handleResize() {
        setisSmallScreen(window.innerWidth < 768);
    }
    window.addEventListener('resize', handleResize);

    // Remove event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  
    }, []);

  const handleSearch = () => {
    const topics = selectedTopics.map(topic => topic.value).join(',');
    let query = {
      q: searchTerm,
      type: typeFilter,
      year: yearFilter,
      topic: topics
    };
    console.log(topics);

    axios.get('https://publicationmolalab.wl.r.appspot.com/posts/search', { params: query })
      .then(response => {
        setPublications(response.data);
      })
      .catch(error => {
        console.error('Error searching publications:', error);
      });
  };

  return (
    <div className="filter_search">
      <div className="row">
      {isSmallScreen && (
          <div className="col-12">
            <button
              className="btn btn-primary mb-3 d-md-none filter-button"
              onClick={() => setShowFilterPopup(!showFilterPopup)}
            >
              Filter
            </button>
          </div>
        )}
       {showFilterPopup && (
          <div className="filter-pop-up-container">
            {/* Filter and Search form for the pop-up */}
            {/* ... (Your filter and search form for pop-up) */}
            {/* Type Selector */}
            <div className="type_select mb-3 position-relative">
                <label className="form-label">Type</label>
                    <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                        <option value="">All</option>
                        <option value="book">Book</option>
                        <option value="book-chapter">Book Chapter</option>
                        <option value="journal-article">Journal Article</option>
                        <option value="preprint">Preprint</option>
                        <option value="proceeding">Proceeding</option>
                    </select>
                {typeFilter && 
                    <span 
                        className="position-absolute" 
                        style={{ top: "76%", transform: "translateY(-50%)", right: "30px", cursor: "pointer" }} 
                    onClick={() => setTypeFilter('')}
                    >
                        ✖
                </span>
                }
            </div>

            {/* Year Selector */}
            <div className="year_select mb-3 position-relative">
                <label className="form-label">Year:</label>
                    <select className="form-select" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
                        <option value="">All</option>
                        {Array.from({ length: 18 }, (_, i) => 2006 + i).map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                {yearFilter && 
                    <span 
                        className="position-absolute" 
                        style={{ top: "76%", transform: "translateY(-50%)", right: "30px", cursor: "pointer" }} 
                        onClick={() => setYearFilter('')}
                    >
                        ✖
                    </span>
                }
            </div>
            
            {/* Topic Selector */}
            <div className="topic mb-3 position-relative">
                <label className="form-label">Topic:</label>
                    <Select
                        isMulti
                        options={topicOptions}
                        value={selectedTopics}
                        onChange={setSelectedTopics}
                    />
            </div>

            {/*<div className="topic_select mb-3 position-relative">
                <label className="form-label">Topic:</label>
                <select className="form-select" value={topicFilter} onChange={e => setTopicFilter(e.target.value)}>
                    <option value="">All</option>
                    {["Counterfactuals", "Culture", "Education", "Environment", "Fairness In AI", "FMRI", "Geo-spatial", "Hate", "Language", "Method", "Modeling", "Morality", "Politics", "Social Networks", "Virtual Humans"].map(topic => (
                    <option key={topic} value={topic}>{topic}</option>
                    ))}
                </select>
            </div>
                    */}

            {/* Search */}
            <div className="search_input mb-3 position-relative">
                <label className="form-label">Search:</label>
                    <input
                        className="form-control"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder='Search'
                    />
                {searchTerm && 
                    <span 
                        className="position-absolute" 
                        style={{ top: "76%", transform: "translateY(-50%)", right: "10px", cursor: "pointer" }} 
                        onClick={() => setSearchTerm('')}
                    >
                        ✖
                    </span>
                }
            </div>
            <div className='close-button-div'>
                <button className="btn btn-primary mb-2" onClick={handleSearch}>Search</button>
            </div>
            <div className='close-button-div mt-2'>
            <div className="close-button" onClick={() => setShowFilterPopup(false)}>
                ✖
            </div>
            </div>
          </div>
      )}
      {!isSmallScreen && (
        <div className={`col-md-3 col-sm-12`}>  

          {/* Type Selector */}
          <div className="type_select mb-3 position-relative">
            <label className="form-label">Type</label>
            <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">All</option>
              <option value="book">Book</option>
              <option value="book-chapter">Book Chapter</option>
              <option value="journal-article">Journal Article</option>
              <option value="preprint">Preprint</option>
              <option value="proceeding">Proceeding</option>
            </select>
            {typeFilter && 
                <span 
                    className="position-absolute" 
                    style={{top: "76%", transform: "translateY(-50%)", right: "30px", cursor: "pointer"}} 
                    onClick={() => setTypeFilter('')}
                >
                    ✖
                </span>
            }
          </div>

          {/* Year Selector */}
          <div className="year_select mb-3 position-relative">
            <label className="form-label">Year:</label>
            <select className="form-select" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
              <option value="">All</option>
              {Array.from({ length: 18 }, (_, i) => 2006 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {yearFilter && 
                <span 
                    className="position-absolute" 
                    style={{top: "76%", transform: "translateY(-50%)", right: "30px", cursor: "pointer"}} 
                    onClick={() => setYearFilter('')}
                >
                    ✖
                </span>
            }
          </div>

          {/* Topic Selector */}
          <div className="topic_select mb-3 position-relative">
                <label className="form-label">Topic:</label>
                    <Select
                        isMulti
                        options={topicOptions}
                        value={selectedTopics}
                        onChange={setSelectedTopics}
                    />
            </div>

          {/* Search */}
          <div className="search_input mb-3 position-relative">
            <label className="form-label">Search:</label>
            <input
              className="form-control"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder='Search'
            />
            {searchTerm && 
                <span 
                    className="position-absolute" 
                    style={{top: "76%", transform: "translateY(-50%)", right: "10px", cursor: "pointer"}} 
                    onClick={() => setSearchTerm('')}
                >
                    ✖
                </span>
            }
          </div>
        

          <button className="btn btn-primary mb-2" onClick={handleSearch}>Search</button>
        </div>
        )}
        
        <div className="col-md-9 col-sm-12">
          {publications.map(pub => (
            <div key={pub._id} className="publication mb-4">
              <h2>{pub.title}</h2>
              <p>{pub.authors}</p>
              <a href="#" onClick={() => handleBibDownload(pub)}>bib</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Pub;
