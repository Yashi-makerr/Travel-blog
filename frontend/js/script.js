// UNIVERSAL IMAGE MODAL SYSTEM (Works for ALL static destination/header images, ignoring modal images)
const modal = document.createElement("div");
modal.id = "globalImageModal";
modal.className = "modal";
modal.innerHTML = `
    <span class="close">&times;</span>
    <img class="modal-content" id="modal-img">
`;
document.body.appendChild(modal);

const modalImg = document.getElementById("modal-img");
const closeBtn = modal.querySelector(".close");

document.addEventListener("click", (e) => {
  // Trigger only on destination and category images, avoid modal, blog-card, banner images, and country cards
  if (
    e.target.tagName === 'IMG' && 
    !e.target.classList.contains('no-modal') &&
    !e.target.closest('#storyModal') && 
    !e.target.closest('.blog-card') && 
    !e.target.closest('.modal-container') &&
    !e.target.closest('.banner__container') &&
    !e.target.closest('.country__card')
  ) {
    modal.style.display = "block";
    modalImg.src = e.target.src;
  }
});

// DESTINATION DETAILS POPUP MODAL SYSTEM
document.addEventListener("DOMContentLoaded", () => {
  const destModal = document.createElement("div");
  destModal.id = "destinationModal";
  destModal.className = "dest-modal";
  destModal.innerHTML = `
    <div class="dest-modal-content">
      <span class="dest-close">&times;</span>
      <div class="dest-hero">
        <img id="dest-img" src="" alt="" class="no-modal">
        <div class="dest-hero-overlay">
          <h2 id="dest-title">Destination Name</h2>
        </div>
      </div>
      <div class="dest-details">
        <div class="dest-info-section">
          <h3>About the Destination</h3>
          <p id="dest-description">Description...</p>
        </div>
        <div class="dest-meta-grid">
          <div class="dest-meta-item">
            <i class="fas fa-calendar-alt"></i>
            <div>
              <strong>Best Time to Visit</strong>
              <span id="dest-time">Season</span>
            </div>
          </div>
          <div class="dest-meta-item">
            <i class="fas fa-star"></i>
            <div>
              <strong>Key Highlights</strong>
              <span id="dest-highlights">Highlights...</span>
            </div>
          </div>
          <div class="dest-meta-item">
            <i class="fas fa-compass"></i>
            <div>
              <strong>Travel Type</strong>
              <span id="dest-type">Type</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(destModal);

  const destClose = destModal.querySelector(".dest-close");
  destClose.addEventListener("click", () => {
    destModal.style.display = "none";
  });
  destModal.addEventListener("click", (e) => {
    if (e.target === destModal) {
      destModal.style.display = "none";
    }
  });

  const destinationsData = {
    "Santorini, Greece": {
      description: "A breathtaking volcanic island in the Aegean Sea, famous for its iconic white-washed buildings with cobalt-blue domes perched on cliffs, dramatic calderas, and world-class sunset views in Oia.",
      time: "April to October",
      highlights: "Oia Sunset Walk, Red Beach, Caldera Boat Tour, Akrotiri Ruins",
      type: "Luxury & Romantic"
    },
    "Vernazza, Italy": {
      description: "One of the five historic fishing villages of the Cinque Terre on the Italian Riviera. It is characterized by steep terraces, colorful pastel houses clinging to cliffs, a small harbor, and fresh seafood.",
      time: "May to September",
      highlights: "Doria Castle overlooking the harbor, Santa Margherita di Antiochia Church, Hiking trail to Corniglia",
      type: "Cultural & Hiking"
    },
    "San Francisco": {
      description: "A vibrant cultural hub in Northern California known for the majestic Golden Gate Bridge, rolling hills, historic cable cars, architectural landmarks, and cool summer fog.",
      time: "September to November",
      highlights: "Golden Gate Bridge, Alcatraz Island, Fisherman's Wharf, Cable Car ride",
      type: "City Explorer & Historic"
    },
    "Navagio, Greece": {
      description: "Also known as Shipwreck Beach, this isolated sandy cove on the coast of Zakynthos is accessible only by boat. It features a historic freightliner wreck buried in limestone cliffs and brilliant cyan waters.",
      time: "May to October",
      highlights: "The Shipwreck (MV Panagiotis), panoramic cliff-edge viewpoint, Blue Caves boat tour, snorkeling",
      type: "Adventure & Scenic"
    },
    "Ao Nang, Thailand": {
      description: "A vibrant resort town in Krabi Province, serving as a gateway to stunning limestone karsts, sandy beaches, and neighboring islands. It offers a perfect blend of nightlife and natural beauty.",
      time: "November to April",
      highlights: "Ao Nang Beach, Monkey Trail, Railay Beach longtail boat trip, Tiger Cave Temple",
      type: "Tropical & Adventure"
    },
    "Phi Phi Island, Thailand": {
      description: "An archipelago of pristine islands in the Andaman Sea. It boasts towering limestone cliffs surrounding turquoise lagoons, vibrant coral reefs, and the world-famous Maya Bay.",
      time: "November to April",
      highlights: "Maya Bay beach stroll, Pileh Lagoon swimming, Phi Phi Viewpoint hike, snorkeling at Bamboo Island",
      type: "Tropical Escape & Diving"
    }
  };

  document.addEventListener("click", (e) => {
    const card = e.target.closest(".country__card");
    if (card) {
      const img = card.querySelector("img");
      const name = card.querySelector(".country__name span").textContent.trim();
      const data = destinationsData[name];
      if (data) {
        destModal.querySelector("#dest-img").src = img.src;
        destModal.querySelector("#dest-title").textContent = name;
        destModal.querySelector("#dest-description").textContent = data.description;
        destModal.querySelector("#dest-time").textContent = data.time;
        destModal.querySelector("#dest-highlights").textContent = data.highlights;
        destModal.querySelector("#dest-type").textContent = data.type;
        destModal.style.display = "block";
      }
    }
  });
});

closeBtn.onclick = () => (modal.style.display = "none");
modal.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
};

// Travel Blog contact form → backend /api/messages
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const statusEl = document.getElementById("contactStatus");

  if (!form) return; // safety

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
      statusEl.textContent = "Please fill all fields.";
      statusEl.style.color = "#ff6b6b";
      return;
    }

    statusEl.textContent = "Sending...";
    statusEl.style.color = "#ffffff";

    try {
      const res = await fetch(`${API_BASE_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        statusEl.textContent = data.error || "Something went wrong.";
        statusEl.style.color = "#ff6b6b";
      } else {
        statusEl.textContent = "Message sent successfully! 🎉";
        statusEl.style.color = "#4ade80";
        form.reset();
      }
    } catch (err) {
      console.error(err);
      statusEl.textContent = "Server error. Please try again later.";
      statusEl.style.color = "#ff6b6b";
    }
  });
});

// Dynamic navbar update for index.html (Home Page)
document.addEventListener("DOMContentLoaded", () => {
  const navLinksContainer = document.querySelector(".nav__links");
  if (!navLinksContainer) return;

  const user = JSON.parse(localStorage.getItem("user"));
  
  const staticHtml = `
    <li><a href="#Home"><strong>Home</strong></a></li>
    <li><a href="#journey_container">Destinations</a></li>
    <li><a href="#blog-section">Blog</a></li>
    <li><a href="#offers">Offers</a></li>
    <li><a href="#about">About</a></li>
    <li><a href="#contact">Contact Us</a></li>
  `;

  let dynamicHtml = '';
  if (user) {
    dynamicHtml = `
      <li><a href="upload.html" class="write-btn" style="margin-left: 5px;">Share Story</a></li>
      <li><a href="#" id="homeLogoutBtn" style="color: #ef4444; font-weight: bold; margin-left: 5px;">Logout</a></li>
    `;
  } else {
    dynamicHtml = `
      <li><a href="login.html">Login</a></li>
      <li><a href="signup.html" style="background: rgba(102, 156, 203, 0.15); border: 1px solid var(--border-glass-active); border-radius: 6px;">Sign up</a></li>
    `;
  }

  navLinksContainer.innerHTML = staticHtml + dynamicHtml;

  const logoutBtn = document.getElementById("homeLogoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("user");
      window.location.reload();
    });
  }
});

// Dynamic Travel Stories Hub on Homepage (Infinite Scrolling, Filtering & Dialog)
document.addEventListener("DOMContentLoaded", () => {
  const blogGrid = document.getElementById("blogGrid");
  const scrollTrigger = document.getElementById("scrollTrigger");
  const searchInput = document.getElementById("searchInput");
  const filterTabs = document.getElementById("filterTabs");

  if (!blogGrid || !scrollTrigger) return; // Only run on index.html containing the stories feed

  // Modal Dialog Elements
  const storyModal = document.getElementById("storyModal");
  const modalClose = document.getElementById("modalClose");
  const modalImg = document.getElementById("modalImg");
  const modalTitle = document.getElementById("modalTitle");
  const modalAuthor = document.getElementById("modalAuthor");
  const modalDate = document.getElementById("modalDate");
  const modalGender = document.getElementById("modalGender");
  const modalGenderGroup = document.getElementById("modalGenderGroup");
  const modalText = document.getElementById("modalText");
  const commentInput = document.getElementById("commentInput");
  const postCommentBtn = document.getElementById("postCommentBtn");
  const commentsList = document.getElementById("commentsList");
  const commentCountEl = document.getElementById("commentCount");

  // Pagination & Filtering State
  let currentPage = 1;
  const limit = 4;
  let isLoading = false;
  let hasMore = true;
  let loadedStories = [];
  let activeCategory = "all";
  let searchQuery = "";

  // Helper: Assign tag values based on story keywords
  function getCategoryTag(storyText) {
    const text = storyText.toLowerCase();
    if (text.includes("climb") || text.includes("dive") || text.includes("adventure") || text.includes("hike") || text.includes("mountain") || text.includes("peak")) {
      return "adventure";
    } else if (text.includes("luxury") || text.includes("resort") || text.includes("jet") || text.includes("luxe") || text.includes("villas")) {
      return "luxury";
    } else if (text.includes("culture") || text.includes("festival") || text.includes("historic") || text.includes("ancient") || text.includes("tradition")) {
      return "culture";
    }
    return "wanderlust";
  }

  // Helper: Auto extract title sentence from content
  function extractTitle(storyText) {
    const sentences = storyText.split(/[.!?]/);
    let title = sentences[0] || "My Travel Memoir";
    const words = title.split(" ");
    if (words.length > 8) {
      return words.slice(0, 8).join(" ") + "...";
    }
    return title;
  }

  // Helper: Assemble Card Element
  function createStoryCard(story) {
    const category = story.aiCategory || getCategoryTag(story.story);
    const title = extractTitle(story.story);
    const formattedDate = new Date(story.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });

    const card = document.createElement("div");
    card.className = "blog-card";
    card.dataset.id = story._id;
    card.dataset.category = category;

    card.innerHTML = `
      <div class="card-img-wrapper">
        <img src="${story.imageUrl}" alt="${title}" class="no-modal">
        <span class="card-tag">${category.toUpperCase()}</span>
      </div>
      <div class="card-content">
        <div>
          <div class="card-meta">
            <span class="card-author"><i class="fas fa-user-circle"></i> ${story.name}</span>
            <span>${formattedDate}</span>
          </div>
          <h3 class="card-title">${title}</h3>
          <p class="card-description">${story.story}</p>
        </div>
        <div class="card-footer">
          Read Story <i class="fas fa-arrow-right"></i>
        </div>
      </div>
    `;

    card.addEventListener("click", () => openStoryModal(story, category, title, formattedDate));
    return card;
  }

  // Fetch Stories dynamically from backend
  async function fetchStories() {
    if (isLoading || !hasMore) return;
    isLoading = true;

    try {
      const res = await fetch(`${API_BASE_URL}/api/stories?page=${currentPage}&limit=${limit}`);
      const data = await res.json();

      if (currentPage === 1) {
        blogGrid.innerHTML = ""; // Clear loader skeletons
      }

      if (data.stories && data.stories.length > 0) {
        data.stories.forEach(story => {
          loadedStories.push(story);
          const card = createStoryCard(story);
          blogGrid.appendChild(card);
        });

        applyFilterAndSearch();

        hasMore = data.hasMore;
        currentPage++;
      } else {
        hasMore = false;
      }

      if (!hasMore) {
        scrollTrigger.innerHTML = `<div class="no-more-msg">You've explored all the stories! ✨</div>`;
        observer.unobserve(scrollTrigger);
      }
    } catch (err) {
      console.error("Error fetching stories from backend:", err);
      if (currentPage === 1) {
        blogGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #ef4444; font-weight: 600; padding: 40px;">Failed to load travel stories from database.</div>`;
      }
    } finally {
      isLoading = false;
    }
  }

  // Sync displayed cards based on active filtering and query parameters
  function applyFilterAndSearch() {
    const cards = blogGrid.querySelectorAll(".blog-card");
    let countVisible = 0;

    cards.forEach(card => {
      const cardCat = card.dataset.category;
      const cardTitle = card.querySelector(".card-title").textContent.toLowerCase();
      const cardAuthor = card.querySelector(".card-author").textContent.toLowerCase();
      const cardDesc = card.querySelector(".card-description").textContent.toLowerCase();

      const matchesCategory = (activeCategory === "all" || cardCat === activeCategory);
      const matchesSearch = (
        cardTitle.includes(searchQuery) ||
        cardAuthor.includes(searchQuery) ||
        cardDesc.includes(searchQuery)
      );

      if (matchesCategory && matchesSearch) {
        card.style.display = "flex";
        countVisible++;
      } else {
        card.style.display = "none";
      }
    });

    const existingMsg = document.getElementById("noStoriesMessage");
    if (countVisible === 0 && loadedStories.length > 0) {
      if (!existingMsg) {
        const msg = document.createElement("div");
        msg.id = "noStoriesMessage";
        msg.style.cssText = "grid-column: 1/-1; text-align: center; color: var(--text-light); padding: 50px 0;";
        msg.innerHTML = `<i class="fas fa-compass" style="font-size: 2.5rem; margin-bottom: 15px; color: var(--primary-color);"></i><p>No stories found matching your search options.</p>`;
        blogGrid.appendChild(msg);
      }
    } else if (existingMsg) {
      existingMsg.remove();
    }
  }

  // IntersectionObserver Trigger observer configurations
  const observerOptions = {
    root: null,
    rootMargin: "0px 0px 250px 0px",
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isLoading && hasMore) {
        fetchStories();
      }
    });
  }, observerOptions);

  observer.observe(scrollTrigger);

  // Filter tab interactions
  filterTabs.addEventListener("click", (e) => {
    const tab = e.target.closest(".tab");
    if (!tab) return;

    filterTabs.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    activeCategory = tab.dataset.category;
    applyFilterAndSearch();
  });

  // Search input matching
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    applyFilterAndSearch();
  });

  // Modal popup dialog triggers
  function openStoryModal(story, category, title, formattedDate) {
    modalImg.src = story.imageUrl;
    modalTitle.textContent = title;
    modalAuthor.textContent = story.name;
    modalDate.textContent = formattedDate;
    modalText.textContent = story.story;

    if (story.gender) {
      modalGender.textContent = story.gender.charAt(0).toUpperCase() + story.gender.slice(1);
      modalGenderGroup.style.display = "flex";
    } else {
      modalGenderGroup.style.display = "none";
    }

    // Dynamic AI Insights Box
    let aiBox = document.getElementById("modalAiBox");
    if (!aiBox) {
      aiBox = document.createElement("div");
      aiBox.id = "modalAiBox";
      modalText.parentNode.insertBefore(aiBox, modalText);
    }
    
    if (story.aiSummary || (story.aiTags && story.aiTags.length > 0)) {
      aiBox.innerHTML = `
        <div style="background: rgba(139, 92, 246, 0.06); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 10px; padding: 15px; margin-bottom: 20px;">
          <h4 style="font-size: 0.95rem; color: #a78bfa; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; font-weight: 600;">
            <i class="fas fa-brain"></i> AI Insights
          </h4>
          ${story.aiSummary ? `<p style="font-size: 0.9rem; color: #cbd5e0; font-style: italic; margin-bottom: 8px; line-height: 1.4;"><strong>AI Summary:</strong> ${story.aiSummary}</p>` : ''}
          ${story.aiTags && story.aiTags.length > 0 ? `
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              ${story.aiTags.map(tag => `<span style="background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.25); padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; color: #c084fc;">#${tag}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `;
      aiBox.style.display = "block";
    } else {
      aiBox.style.display = "none";
    }

    // Default mock comments
    commentCountEl.textContent = "2";
    commentsList.innerHTML = `
      <div class="comment-item">
        <div class="comment-header">
          <span class="comment-user">Alex Johnson</span>
          <span>1 day ago</span>
        </div>
        <p class="comment-content">This is absolutely stunning! Added to my travel bucket list immediately.</p>
      </div>
      <div class="comment-item">
        <div class="comment-header">
          <span class="comment-user">Sarah Miller</span>
          <span>2 days ago</span>
        </div>
        <p class="comment-content">Incredible story. The way you described the local guide was so touching.</p>
      </div>
    `;
    commentInput.value = "";

    // Dynamic Recommendations Box
    let recsBox = document.getElementById("modalRecsBox");
    if (!recsBox) {
      recsBox = document.createElement("div");
      recsBox.id = "modalRecsBox";
      recsBox.style.cssText = "margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; margin-bottom: 25px;";
      const commentSection = document.querySelector(".comment-section");
      if (commentSection) {
        commentSection.parentNode.insertBefore(recsBox, commentSection);
      } else {
        modalText.parentNode.appendChild(recsBox);
      }
    }

    recsBox.innerHTML = `
      <h4 style="font-size: 1.1rem; color: #669ccb; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; font-weight: 600;">
        <i class="fas fa-compass"></i> Similar Adventures
      </h4>
      <div id="recsContainer" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 15px;">
        <div style="color: #a0aec0; font-size: 0.85rem;">Calculating similar journeys...</div>
      </div>
    `;

    fetch(`${API_BASE_URL}/api/stories/${story._id}/recommendations`)
      .then(res => res.json())
      .then(recommendations => {
        const recsContainer = document.getElementById("recsContainer");
        if (!recsContainer) return;
        
        if (!recommendations || recommendations.length === 0) {
          recsContainer.innerHTML = `<div style="color: #a0aec0; font-size: 0.85rem; grid-column: 1/-1;">No similar adventures found.</div>`;
          return;
        }

        recsContainer.innerHTML = "";
        recommendations.forEach(rec => {
          const recCat = rec.aiCategory || getCategoryTag(rec.story);
          const recTitle = extractTitle(rec.story);
          const recDate = new Date(rec.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          });

          const recCard = document.createElement("div");
          recCard.style.cssText = "background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; overflow: hidden; cursor: pointer; transition: all 0.3s ease; display: flex; flex-direction: column;";
          
          recCard.innerHTML = `
            <div style="height: 90px; overflow: hidden; position: relative;">
              <img src="${rec.imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" class="no-modal">
              <span style="position: absolute; top: 6px; left: 6px; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; color: #fff; text-transform: uppercase; font-weight: 700; border: 1px solid rgba(255, 255, 255, 0.1);">${recCat}</span>
            </div>
            <div style="padding: 10px; display: flex; flex-direction: column; flex-grow: 1; justify-content: space-between;">
              <h5 style="margin: 0 0 6px 0; font-size: 0.85rem; color: #fff; font-weight: 600; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${recTitle}</h5>
              <span style="font-size: 0.72rem; color: #a0aec0; display: flex; align-items: center; gap: 4px;"><i class="fas fa-user-circle"></i> ${rec.name}</span>
            </div>
          `;

          recCard.addEventListener("mouseenter", () => {
            recCard.style.background = "rgba(255, 255, 255, 0.08)";
            recCard.style.borderColor = "rgba(102, 156, 203, 0.4)";
            recCard.style.transform = "translateY(-2px)";
          });
          recCard.addEventListener("mouseleave", () => {
            recCard.style.background = "rgba(255, 255, 255, 0.04)";
            recCard.style.borderColor = "rgba(255, 255, 255, 0.08)";
            recCard.style.transform = "none";
          });

          recCard.addEventListener("click", () => {
            openStoryModal(rec, recCat, recTitle, recDate);
            const container = document.querySelector(".modal-container");
            if (container) container.scrollTop = 0;
          });

          recsContainer.appendChild(recCard);
        });
      })
      .catch(err => {
        console.error("Error loading recommendations:", err);
        const recsContainer = document.getElementById("recsContainer");
        if (recsContainer) {
          recsContainer.innerHTML = `<div style="color: #ef4444; font-size: 0.85rem; grid-column: 1/-1;">Failed to load similar adventures.</div>`;
        }
      });

    storyModal.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeStoryModal() {
    storyModal.classList.remove("show");
    document.body.style.overflow = "auto";
  }

  if (modalClose) modalClose.addEventListener("click", closeStoryModal);
  if (storyModal) {
    storyModal.addEventListener("click", (e) => {
      if (e.target === storyModal) closeStoryModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && storyModal && storyModal.classList.contains("show")) {
      closeStoryModal();
    }
  });

  // Comment Posting connection
  if (postCommentBtn) {
    postCommentBtn.addEventListener("click", () => {
      const text = commentInput.value.trim();
      if (!text) return;

      const user = JSON.parse(localStorage.getItem("user"));
      const authorName = user ? user.name : "Anonymous Explorer";

      const newComment = document.createElement("div");
      newComment.className = "comment-item";
      newComment.innerHTML = `
        <div class="comment-header">
          <span class="comment-user">${authorName}</span>
          <span>Just now</span>
        </div>
        <p class="comment-content">${text}</p>
      `;

      commentsList.insertBefore(newComment, commentsList.firstChild);
      commentInput.value = "";

      const count = parseInt(commentCountEl.textContent) + 1;
      commentCountEl.textContent = count;
    });
  }
});
