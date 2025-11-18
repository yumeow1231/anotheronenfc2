// 使用 localStorage 存储所有 slot 数据
// 结构：{ slot0: { name: "...", imageData: "data:image/..." }, ... }

const STORAGE_KEY = "another_one_slots_v1";

const screenOverview = document.getElementById("screen-overview");
const screenDetail = document.getElementById("screen-detail");

const slots = document.querySelectorAll(".slot");
const backBtn = document.getElementById("back-btn");

const detailImage = document.getElementById("detail-image");
const nameInput = document.getElementById("name-input");

const uploadBtn = document.getElementById("upload-btn");
const fileInput = document.getElementById("file-input");
const clearBtn = document.getElementById("clear-btn");

const labelsBtn = document.getElementById("labels-btn");
const labelModal = document.getElementById("label-modal");
const labelInput = document.getElementById("label-input");
const labelAddBtn = document.getElementById("label-add-btn");
const labelList = document.getElementById("label-list");


let currentSlotIndex = 0;
let slotsData = {}; // 内存里的缓存

// ---------- 工具函数 ----------

function slotId(i) {
  return `slot${i}`;
}

function loadFromLocal() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("parse localStorage error", e);
    return {};
  }
}

function saveToLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slotsData));
}

// ---------- UI 切换 ----------

function showOverview() {
  screenDetail.classList.add("hidden");
  screenOverview.classList.remove("hidden");
  renderGrid();
}

function showDetail(i) {
  currentSlotIndex = i;
  const id = slotId(i);
  const data = slotsData[id] || {};

  nameInput.value = data.name || "";
  detailImage.src = data.imageData || "";

  // 打开详情
  screenOverview.classList.add("hidden");
  screenDetail.classList.remove("hidden");

  // 确保弹窗关闭
  labelModal.classList.add("hidden");
}


// ---------- 渲染九宫格 ----------

function renderGrid() {
  slots.forEach(slot => {
    const i = slot.dataset.slot;
    const id = slotId(i);
    const data = slotsData[id];

    slot.innerHTML = "";
    if (data && data.imageData) {
      const img = document.createElement("img");
      img.src = data.imageData;
      slot.appendChild(img);
    }
  });
}

// ---------- 初始化 ----------

function init() {
  slotsData = loadFromLocal();
  renderGrid();
}

init();

// ---------- 事件绑定 ----------

// 点击九宫格 → 进入详情页
slots.forEach(slot => {
  slot.addEventListener("click", () => {
    showDetail(Number(slot.dataset.slot));
  });
});

// 返回按钮
backBtn.addEventListener("click", showOverview);

// Name 输入框失焦时保存
nameInput.addEventListener("blur", () => {
  const id = slotId(currentSlotIndex);
  const newName = nameInput.value.trim();

  if (!slotsData[id]) slotsData[id] = {};
  slotsData[id].name = newName;

  saveToLocal();
});

// 上传图片
uploadBtn.addEventListener("click", () => {
  fileInput.value = "";
  fileInput.click();
});

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const dataUrl = ev.target.result; // base64 字符串

    const id = slotId(currentSlotIndex);
    if (!slotsData[id]) slotsData[id] = {};
    slotsData[id].imageData = dataUrl;

    saveToLocal();
    detailImage.src = dataUrl;
    renderGrid();
  };

  reader.readAsDataURL(file);
});

// Clear：清空所有本地数据
clearBtn.addEventListener("click", () => {
  if (!confirm("Clear all 9 slots on this device?")) return;
  slotsData = {};
  saveToLocal();
  renderGrid();
});


labelsBtn.addEventListener("click", () => {
  renderLabelsForCurrentSlot();   // 刷新列表
  labelInput.value = "";          // 清空输入
  labelModal.classList.remove("hidden");
});

// 点击 Add labels 打开弹窗
labelsBtn.addEventListener("click", openLabelModal);

// 点击遮罩空白区域关闭弹窗
labelModal.addEventListener("click", (e) => {
  if (e.target === labelModal) {
    closeLabelModal();
  }
});
// 点击遮罩背景关闭
labelModal.addEventListener("click", (e) => {
  if (e.target === labelModal) {
    labelModal.classList.add("hidden");
  }
});


// 渲染当前 slot 的 label 列表到弹窗里
function renderLabelsForCurrentSlot() {
  const id = slotId(currentSlotIndex);
  const data = slotsData[id] || {};
  const labels = data.labels || [];

  labelList.innerHTML = "";

  labels.forEach(text => {
    const div = document.createElement("div");
    div.className = "label-item";
    div.textContent = text;
    labelList.appendChild(div);
  });
}
function openLabelModal() {
  // 打开前刷新一次 label 列表
  renderLabelsForCurrentSlot();
  // 清空输入框
  labelInput.value = "";
  labelModal.classList.remove("hidden");
}

function closeLabelModal() {
  labelModal.classList.add("hidden");
}

labelAddBtn.addEventListener("click", () => {
  const text = labelInput.value.trim();
  if (!text) return;

  const id = slotId(currentSlotIndex);
  if (!slotsData[id]) slotsData[id] = {};

  if (!Array.isArray(slotsData[id].labels)) {
    slotsData[id].labels = [];
  }
  slotsData[id].labels.push(text);

  saveToLocal();                 // 保存到 localStorage
  labelInput.value = "";         // 清空输入框
  renderLabelsForCurrentSlot();  // 刷新下半部分列表
});
labelsBtn.addEventListener("click", () => {
  renderLabelsForCurrentSlot();   // 刷新列表
  labelInput.value = "";          // 清空输入
  labelModal.classList.remove("hidden");
});