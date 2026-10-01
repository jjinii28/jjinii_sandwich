/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { Coffee, ShoppingBag, RotateCcw, CheckCircle2, AlertCircle, Clock, Phone, User, FileText, ChevronDown, Sparkles, Utensils, Info } from 'lucide-react';
import hamCheeseImg from './assets/images/ham_cheese_toast_1790820080391.jpg';
import bltToastImg from './assets/images/blt_american_toast_1790820095284.jpg';

// 샌드위치 메뉴 타입 정의 (이미지, 상세설명, 재료, 맛특징 추가)
interface SandwichMenu {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  summary: string;
  description: string;
  ingredients: { name: string; icon: string }[];
  flavorPoints: string[];
  allergens: string;
}

// 사이즈 옵션 타입 정의
interface SizeOption {
  id: string;
  name: string;
  extraPrice: number;
}

// 추가 옵션 타입 정의
interface ExtraOption {
  id: string;
  name: string;
  extraPrice: number;
}

// 접수된 주문 내역 타입
interface OrderRecord {
  id: string;
  userName: string;
  userPhone: string;
  sandwichName: string;
  sizeName: string;
  selectedOptionsText: string;
  quantity: number;
  totalPrice: number;
  requestMemo: string;
  orderedAt: string;
}

// 샌드위치 메뉴 목록 (사진, 상세설명, 주요 재료 포함)
const SANDWICH_LIST: SandwichMenu[] = [
  {
    id: 'ham_cheese',
    name: '햄치즈토스트',
    price: 3500,
    imageUrl: hamCheeseImg,
    summary: '단짠고소 시그니처 베이직 토스트',
    description: '노릇노릇 고소하게 구워낸 토스트에 부드러운 고급 슬라이스 햄과 진하게 녹아내린 체다치즈, 달콤한 특제 버터소스가 어우러진 시그니처 토스트입니다.',
    ingredients: [
      { name: '우유식빵', icon: '🍞' },
      { name: '슬라이스 햄', icon: '🥓' },
      { name: '체다치즈', icon: '🧀' },
      { name: '계란지단', icon: '🥚' },
      { name: '버터', icon: '🧈' },
      { name: '달콤 특제소스', icon: '🍯' },
    ],
    flavorPoints: ['바삭함과 촉촉함의 조화', '단짠단짠 마성의 특제 소스', '체다치즈의 고소한 풍미'],
    allergens: '밀, 대두, 우유, 알류(계란), 돼지고기 함유',
  },
  {
    id: 'blt',
    name: 'BLT 아메리칸 토스트',
    price: 4000,
    imageUrl: bltToastImg,
    summary: '베이컨, 양상추, 토마토가 듬뿍 들어간 프리미엄 토스트',
    description: '바삭하게 구운 베이컨(Bacon), 아삭아삭 신선한 양상추(Lettuce), 과즙 풍부한 완숙 토마토(Tomato)와 계란이 어우러진 정통 아메리칸 프리미엄 토스트입니다.',
    ingredients: [
      { name: '토스트식빵', icon: '🍞' },
      { name: '훈제 베이컨', icon: '🥓' },
      { name: '신선 양상추', icon: '🥬' },
      { name: '완숙 생토마토', icon: '🍅' },
      { name: '계란 프라이', icon: '🍳' },
      { name: '홀그레인 마요소스', icon: '🍶' },
    ],
    flavorPoints: ['신선하고 아삭한 프레시함', '훈제 베이컨의 깊은 감칠맛', '든든한 한 끼 식사'],
    allergens: '밀, 대두, 우유, 알류(계란), 돼지고기, 토마토 함유',
  },
];

// 사이즈 옵션 목록 (M 기본 선택)
const SIZE_OPTIONS: SizeOption[] = [
  { id: 'S', name: 'S', extraPrice: 0 },
  { id: 'M', name: 'M', extraPrice: 500 },
  { id: 'L', name: 'L', extraPrice: 1000 },
];

// 추가 옵션 목록
const EXTRA_OPTIONS: ExtraOption[] = [
  { id: 'lettuce', name: '양상추 추가', extraPrice: 500 },
  { id: 'cheese', name: '치즈 추가', extraPrice: 500 },
  { id: 'ham', name: '햄 추가', extraPrice: 300 },
  { id: 'sugar', name: '설탕 많이', extraPrice: 0 },
];

export default function App() {
  // 1. 주문자 이름 상태
  const [userName, setUserName] = useState<string>('');
  
  // 2. 전화번호 상태
  const [userPhone, setUserPhone] = useState<string>('');
  
  // 3. 선택된 샌드위치 ID 상태 (초기값: 미선택 "")
  const [selectedSandwichId, setSelectedSandwichId] = useState<string>('');
  
  // 4. 사이즈 상태 (기본값: M)
  const [selectedSize, setSelectedSize] = useState<string>('M');
  
  // 5. 추가 옵션 상태 (선택된 ID 배열)
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  
  // 6. 수량 상태 (최소 1, 최대 10, 기본값 1)
  const [quantity, setQuantity] = useState<number>(1);
  
  // 7. 요청사항 상태
  const [requestMemo, setRequestMemo] = useState<string>('');

  // 주문 확인 메시지 상태
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  // 입력 유효성 검사 에러/경고 알림 상태
  const [validationAlert, setValidationAlert] = useState<string | null>(null);

  // 게시판용 접수된 주문 목록 상태
  const [orderBoardList, setOrderBoardList] = useState<OrderRecord[]>([
    {
      id: 'demo-1',
      userName: '김철수',
      userPhone: '010-1234-5678',
      sandwichName: 'BLT 아메리칸 토스트',
      sizeName: 'M',
      selectedOptionsText: '치즈 추가',
      quantity: 1,
      totalPrice: 5000,
      requestMemo: '바삭하게 구워주세요!',
      orderedAt: '10분 전',
    },
  ]);

  // 입력 필드 포커스를 위한 Ref
  const nameInputRef = useRef<HTMLInputElement>(null);
  const sandwichSelectRef = useRef<HTMLSelectElement>(null);

  // 샌드위치 메뉴 정보 가져오기
  const currentSandwich = useMemo(() => {
    return SANDWICH_LIST.find((item) => item.id === selectedSandwichId) || null;
  }, [selectedSandwichId]);

  // 사이즈 추가금 가져오기
  const currentSizeOption = useMemo(() => {
    return SIZE_OPTIONS.find((s) => s.id === selectedSize) || SIZE_OPTIONS[1];
  }, [selectedSize]);

  // 추가 옵션 합계 금액 계산
  const extraOptionsPrice = useMemo(() => {
    return selectedOptionIds.reduce((sum, optId) => {
      const opt = EXTRA_OPTIONS.find((item) => item.id === optId);
      return sum + (opt ? opt.extraPrice : 0);
    }, 0);
  }, [selectedOptionIds]);

  // [실시간 예상 금액 계산]
  // 샌드위치 미선택 시 0원, 선택 시: (샌드위치 기본가격 + 사이즈 추가금 + 추가옵션 합계) * 수량
  const estimatedPrice = useMemo(() => {
    if (!currentSandwich) {
      return 0;
    }
    const unitPrice = currentSandwich.price + currentSizeOption.extraPrice + extraOptionsPrice;
    return unitPrice * quantity;
  }, [currentSandwich, currentSizeOption, extraOptionsPrice, quantity]);

  // 추가 옵션 체크박스 토글 핸들러
  const handleOptionToggle = (optionId: string) => {
    setSelectedOptionIds((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
    );
  };

  // 수량 변경 핸들러 (최소 1, 최대 10 제한)
  const handleQuantityChange = (val: number) => {
    if (isNaN(val)) return;
    if (val < 1) setQuantity(1);
    else if (val > 10) setQuantity(10);
    else setQuantity(val);
  };

  // 다시 작성(초기화) 버튼 핸들러
  const handleReset = () => {
    setUserName('');
    setUserPhone('');
    setSelectedSandwichId('');
    setSelectedSize('M');
    setSelectedOptionIds([]);
    setQuantity(1);
    setRequestMemo('');
    setConfirmationMessage(null);
    setValidationAlert(null);
  };

  // 주문하기 버튼 핸들러
  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. 이름 필수 검사
    if (!userName.trim()) {
      setValidationAlert('이름을 입력해주세요');
      nameInputRef.current?.focus();
      return;
    }

    // 2. 샌드위치 선택 필수 검사
    if (!selectedSandwichId || !currentSandwich) {
      setValidationAlert('샌드위치를 선택해주세요');
      sandwichSelectRef.current?.focus();
      return;
    }

    // 에러 알림 초기화
    setValidationAlert(null);

    // 선택된 추가 옵션 텍스트 생성 (예: "(햄 추가)" 또는 "(양상추 추가, 치즈 추가)")
    const selectedOptionsNames = selectedOptionIds
      .map((id) => EXTRA_OPTIONS.find((item) => item.id === id)?.name)
      .filter(Boolean) as string[];

    const optionsString =
      selectedOptionsNames.length > 0 ? ` (${selectedOptionsNames.join(', ')})` : '';

    // 주문 확인 메시지 구성:
    // "홍길동님, 햄치즈토스트 M사이즈 (햄 추가) 1개, 총 5,000원 주문이 접수되었습니다!"
    const formattedPrice = estimatedPrice.toLocaleString();
    const confirmText = `${userName.trim()}님, ${currentSandwich.name} ${currentSizeOption.name}사이즈${optionsString} ${quantity}개, 총 ${formattedPrice}원 주문이 접수되었습니다!`;

    setConfirmationMessage(confirmText);

    // 게시판에 새 주문 추가
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    const newRecord: OrderRecord = {
      id: `order-${Date.now()}`,
      userName: userName.trim(),
      userPhone: userPhone.trim() || '미입력',
      sandwichName: currentSandwich.name,
      sizeName: currentSizeOption.name,
      selectedOptionsText: selectedOptionsNames.length > 0 ? selectedOptionsNames.join(', ') : '기본',
      quantity,
      totalPrice: estimatedPrice,
      requestMemo: requestMemo.trim(),
      orderedAt: `오늘 ${timeString}`,
    };

    setOrderBoardList((prev) => [newRecord, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-[#faf4ef] to-[#f7ede7] text-[#4a383a] py-8 px-4 flex flex-col items-center justify-start">
      {/* 메인 컨테이너: 최대 너비 520px, 가운데 정렬, 둥근 모서리, 부드러운 핑크-베이지 그림자 */}
      <div className="w-full max-w-[520px] bg-white/95 rounded-2xl shadow-xl shadow-[#eed6d1]/40 border border-[#f5ded7] overflow-hidden">
        
        {/* [페이지 상단]: 샌드위치 로고 🥪, 카페 이름, 부제 (연핑크 & 베이지 그라데이션) */}
        <header className="pt-8 pb-6 px-6 text-center border-b border-[#f6e1dc] bg-gradient-to-b from-[#fff0f3] to-[#fcf6f2]">
          <div className="text-5xl mb-2 select-none filter drop-shadow-sm">🥪</div>
          <h1 className="text-2xl font-bold text-[#b3405b] tracking-tight">jjinii 샌드위치</h1>
          <p className="text-sm text-[#aa727d] mt-1 font-medium">배고프답....</p>
        </header>

        {/* 유효성 검사 경고 알림 팝업/배너 (이름 미입력, 샌드위치 미선택 시) */}
        {validationAlert && (
          <div className="mx-6 mt-4 p-3 bg-[#fff0f4] border border-[#fccad3] rounded-lg text-[#c2284b] flex items-center justify-between text-sm shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#c2284b]" />
              <span className="font-semibold">{validationAlert}</span>
            </div>
            <button
              type="button"
              onClick={() => setValidationAlert(null)}
              className="text-xs text-[#c2284b] hover:underline cursor-pointer ml-2"
            >
              닫기
            </button>
          </div>
        )}

        {/* [주문서 폼] */}
        <form onSubmit={handleOrderSubmit} className="p-6 space-y-5">

          {/* 1. 이름 (필수, text) */}
          <div className="space-y-1.5">
            <label htmlFor="userName" className="block text-sm font-bold text-[#6e434c]">
              1. 이름 <span className="text-[#e04f6e] font-normal">*필수</span>
            </label>
            <div className="relative">
              <input
                ref={nameInputRef}
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value);
                  if (validationAlert === '이름을 입력해주세요' && e.target.value.trim()) {
                    setValidationAlert(null);
                  }
                }}
                placeholder="주문자 성함을 입력해주세요"
                className="custom-input"
                autoComplete="name"
              />
            </div>
          </div>

          {/* 2. 전화번호 (tel) */}
          <div className="space-y-1.5">
            <label htmlFor="userPhone" className="block text-sm font-bold text-[#6e434c]">
              2. 전화번호
            </label>
            <input
              id="userPhone"
              type="tel"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              placeholder="예: 010-1234-5678"
              className="custom-input"
              autoComplete="tel"
            />
          </div>

          {/* 3. 샌드위치 선택 (드롭다운 & 사진/상세정보/재료 보기) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="sandwichSelect" className="block text-sm font-bold text-[#6e434c]">
                3. 샌드위치 선택 <span className="text-[#e04f6e] font-normal">*필수</span>
              </label>
              <span className="text-xs text-[#a5747e]">사진을 눌러도 선택됩니다</span>
            </div>

            {/* 사진으로 바로 선택할 수 있는 비주얼 카드 2종 */}
            <div className="grid grid-cols-2 gap-3">
              {SANDWICH_LIST.map((item) => {
                const isSelected = selectedSandwichId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedSandwichId(item.id);
                      if (validationAlert === '샌드위치를 선택해주세요') {
                        setValidationAlert(null);
                      }
                    }}
                    className={`relative p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer overflow-hidden flex flex-col ${
                      isSelected
                        ? 'border-[#d97788] bg-[#fff5f7] ring-2 ring-[#d97788]/30 shadow-md shadow-[#eedad7]/50'
                        : 'border-[#f2ded9] bg-white hover:border-[#e89aa8] hover:bg-[#fff9fa]'
                    }`}
                  >
                    {/* 샌드위치 이미지 */}
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-[#faf3ef] mb-2 border border-[#f5ded7]">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 bg-[#d97788] text-white p-1 rounded-full shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* 이름 & 가격 */}
                    <h3 className="font-bold text-xs sm:text-sm text-[#5c3a42] truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#b83a5e] mt-0.5">
                      {item.price.toLocaleString()}원
                    </p>
                    <span className="text-[10px] text-[#aa727d] line-clamp-1 mt-0.5">
                      {item.summary}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 필수 조건인 기본 드롭다운 select (htmlFor 라벨 연결 유지) */}
            <div className="relative">
              <select
                ref={sandwichSelectRef}
                id="sandwichSelect"
                value={selectedSandwichId}
                onChange={(e) => {
                  setSelectedSandwichId(e.target.value);
                  if (validationAlert === '샌드위치를 선택해주세요' && e.target.value) {
                    setValidationAlert(null);
                  }
                }}
                className="custom-input appearance-none pr-10 cursor-pointer"
              >
                <option value="">-- 샌드위치를 선택하세요 --</option>
                {SANDWICH_LIST.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.price.toLocaleString()}원)
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#c25e73]">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* 선택된 샌드위치 상세 정보 & 재료 안내 카드 */}
            {currentSandwich ? (
              <div className="bg-[#fff9fa] rounded-xl p-3.5 border border-[#f8dce2] space-y-2.5 animate-fade-in shadow-xs">
                <div className="flex items-center justify-between border-b border-[#f5dbe1] pb-2">
                  <div className="flex items-center gap-1.5">
                    <Utensils className="w-4 h-4 text-[#d97788]" />
                    <span className="text-xs font-bold text-[#8a384b]">
                      {currentSandwich.name} 상세 정보 & 재료
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#fce9ed] text-[#b83a5e]">
                    {currentSandwich.price.toLocaleString()}원
                  </span>
                </div>

                {/* 메뉴 상세 설명 */}
                <p className="text-xs text-[#6e464e] leading-relaxed">
                  {currentSandwich.description}
                </p>

                {/* 사용되는 주요 재료 뱃지 목록 */}
                <div>
                  <span className="block text-[11px] font-bold text-[#8a384b] mb-1.5 flex items-center gap-1">
                    <span>🥗</span> 들어가는 주요 재료
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentSandwich.ingredients.map((ing, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-white border border-[#f2d5dc] text-[#5e3841] font-medium shadow-2xs"
                      >
                        <span>{ing.icon}</span>
                        <span>{ing.name}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 맛 특징 포인트 */}
                <div className="bg-white/80 p-2.5 rounded-lg border border-[#f5ded7] space-y-1">
                  <span className="text-[11px] font-bold text-[#9e4359] block flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#d97788]" /> 맛의 특징
                  </span>
                  <ul className="text-[11px] text-[#6e464e] space-y-0.5 list-disc list-inside">
                    {currentSandwich.flavorPoints.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>

                {/* 알레르기 유발 정보 안내 */}
                <div className="flex items-start gap-1 text-[10px] text-[#aa727d]">
                  <Info className="w-3 h-3 shrink-0 mt-0.5 text-[#d97788]" />
                  <span>알레르기 정보: {currentSandwich.allergens}</span>
                </div>
              </div>
            ) : (
              <div className="bg-[#fdf7f4] rounded-xl p-3 border border-dashed border-[#ecd5ce] text-center text-xs text-[#a5747e]">
                💡 위의 사진 카드 또는 드롭다운에서 샌드위치를 선택하시면 상세 설명과 들어가는 재료를 확인하실 수 있습니다.
              </div>
            )}
          </div>

          {/* 4. 사이즈 (라디오 버튼, 가로 배치) */}
          <div className="space-y-2">
            <span className="block text-sm font-bold text-[#6e434c]">
              4. 사이즈 선택
            </span>
            <div className="flex flex-row flex-wrap items-center gap-4 bg-[#fdf6f2] p-3 rounded-lg border border-[#f3ded8]">
              {SIZE_OPTIONS.map((size) => {
                const radioId = `size_${size.id}`;
                return (
                  <label
                    key={size.id}
                    htmlFor={radioId}
                    className="flex items-center gap-2 cursor-pointer text-sm text-[#5e3d45] select-none hover:text-[#c25e73] transition-colors"
                  >
                    <input
                      id={radioId}
                      type="radio"
                      name="sandwichSize"
                      value={size.id}
                      checked={selectedSize === size.id}
                      onChange={() => setSelectedSize(size.id)}
                      className="w-4 h-4 accent-[#d97788] cursor-pointer"
                    />
                    <span className="font-medium">
                      {size.name} (+{size.extraPrice.toLocaleString()}원)
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 5. 추가 옵션 (체크박스, 가로 배치) */}
          <div className="space-y-2">
            <span className="block text-sm font-bold text-[#6e434c]">
              5. 추가 옵션
            </span>
            <div className="flex flex-row flex-wrap items-center gap-3 bg-[#fdf6f2] p-3 rounded-lg border border-[#f3ded8]">
              {EXTRA_OPTIONS.map((opt) => {
                const checkId = `option_${opt.id}`;
                const isChecked = selectedOptionIds.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    htmlFor={checkId}
                    className={`flex items-center gap-1.5 cursor-pointer text-sm select-none px-2.5 py-1 rounded-md transition-colors ${
                      isChecked
                        ? 'bg-[#fce9ed] text-[#b8435d] font-semibold border border-[#f7ccd5]'
                        : 'text-[#5e3d45] hover:bg-[#faeeea]'
                    }`}
                  >
                    <input
                      id={checkId}
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleOptionToggle(opt.id)}
                      className="w-4 h-4 accent-[#d97788] cursor-pointer rounded"
                    />
                    <span>
                      {opt.name} (+{opt.extraPrice.toLocaleString()}원)
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 6. 수량 (number 타입, 최소 1, 최대 10, 기본값 1) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="quantity" className="block text-sm font-bold text-[#6e434c]">
                6. 수량 (1 ~ 10개)
              </label>
              <span className="text-xs text-[#a5747e]">개당 가격에 반영됩니다</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-lg border border-[#ebd4ce] bg-white text-[#c25e73] font-bold text-lg hover:bg-[#fff2f4] active:bg-[#fce6eb] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                -
              </button>
              <input
                id="quantity"
                type="number"
                min={1}
                max={10}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10))}
                className="custom-input text-center font-bold text-base"
              />
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= 10}
                className="w-10 h-10 rounded-lg border border-[#ebd4ce] bg-white text-[#c25e73] font-bold text-lg hover:bg-[#fff2f4] active:bg-[#fce6eb] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                +
              </button>
            </div>
          </div>

          {/* 7. 요청사항 (textarea) */}
          <div className="space-y-1.5">
            <label htmlFor="requestMemo" className="block text-sm font-bold text-[#6e434c]">
              7. 요청사항
            </label>
            <textarea
              id="requestMemo"
              rows={3}
              value={requestMemo}
              onChange={(e) => setRequestMemo(e.target.value)}
              placeholder="알레르기나 포장, 조리 요청사항이 있으시면 적어주세요."
              className="custom-input resize-none"
            />
          </div>

          {/* [JavaScript 기능 - 실시간 예상 금액 표시 영역] */}
          {/* 주문하기 버튼 바로 위에 큰 글씨(24px), 연핑크/로즈 톤, 굵게, 가운데 정렬 */}
          <div className="pt-2 pb-1 text-center bg-gradient-to-r from-[#fff2f5] via-[#fdf5f1] to-[#fff2f5] rounded-xl p-4 border border-[#f7d9e0] shadow-xs">
            <p className="text-xs text-[#9e6d77] mb-1 font-medium">실시간 계산 금액</p>
            <div
              id="estimatedPriceDisplay"
              className="text-[24px] font-bold text-[#b83a5e] tracking-wide"
            >
              예상 금액: {estimatedPrice.toLocaleString()}원
            </div>
            {!currentSandwich && (
              <p className="text-xs text-[#b0808b] mt-1">
                * 샌드위치를 선택하시면 합산 금액이 표시됩니다.
              </p>
            )}
          </div>

          {/* [8. 주문하기 버튼] & [9. 다시 작성 버튼] */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            {/* 주문하기 버튼: 사랑스러운 로즈 핑크 배경(#d97788), 흰색 글씨, hover시 약간 밝게 */}
            <button
              type="submit"
              className="btn-order flex-1 py-3.5 px-5 rounded-lg font-bold text-base flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#d97788]/25"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>주문하기</span>
            </button>

            {/* 다시 작성 버튼: 따뜻한 베이지 배경, 모든 입력과 금액 초기화 */}
            <button
              type="button"
              onClick={handleReset}
              className="btn-reset py-3.5 px-5 rounded-lg font-medium text-sm flex items-center justify-center gap-1.5 cursor-pointer border border-[#edd7d0]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>다시 작성</span>
            </button>
          </div>

          {/* [주문 확인 메시지] */}
          {/* 핑크색 배경, 연핑크/로즈 글씨, 둥근 모서리 */}
          {confirmationMessage && (
            <div className="mt-5 p-4 rounded-xl bg-[#fff0f4] border border-[#fcc8d3] text-[#9f1b40] shadow-sm animate-fade-in">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#e11d48] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#e11d48] tracking-wider uppercase">
                    ORDER CONFIRMED
                  </p>
                  <p className="text-sm font-semibold leading-relaxed text-[#881337]">
                    {confirmationMessage}
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* [게시판 영역]: 접수된 최근 주문 게시판 현황 */}
        <section className="border-t border-[#f6e2dd] bg-[#fdf8f6] p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#a84d60] flex items-center gap-1.5">
              <span>📋</span> 접수된 주문 게시판 ({orderBoardList.length}건)
            </h2>
            <span className="text-xs text-[#b0808b]">실시간 접수 현황</span>
          </div>

          {orderBoardList.length === 0 ? (
            <p className="text-xs text-center text-gray-400 py-4">접수된 주문이 없습니다.</p>
          ) : (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {orderBoardList.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-3 rounded-lg border border-[#f3dfda] shadow-xs text-xs space-y-1 hover:border-[#e594a3] transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#6e434c] text-sm flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#b0808b]" />
                      {order.userName} 고객님
                    </span>
                    <span className="text-[11px] text-[#aa727d] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {order.orderedAt}
                    </span>
                  </div>
                  <div className="text-[#b8435d] font-medium">
                    {order.sandwichName} ({order.sizeName}사이즈) × {order.quantity}개
                  </div>
                  <div className="text-gray-500 flex items-center justify-between">
                    <span>추가: {order.selectedOptionsText}</span>
                    <span className="font-bold text-[#b83a5e] text-xs">
                      {order.totalPrice.toLocaleString()}원
                    </span>
                  </div>
                  {order.requestMemo && (
                    <div className="text-[11px] text-[#8c5963] bg-[#fdf4f0] p-1.5 rounded mt-1 italic border border-[#f7e8e4]">
                      " {order.requestMemo} "
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 카페 푸터 안내 */}
        <footer className="py-3 px-6 text-center bg-[#fdf6f2] border-t border-[#f5ded7] text-[11px] text-[#a6747e]">
          jjinii 샌드위치 전문점 • 주문 즉시 신선하게 조리합니다 🥪
        </footer>
      </div>
    </div>
  );
}
