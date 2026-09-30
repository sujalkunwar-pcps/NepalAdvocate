import os
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments
)
from peft import LoraConfig
from trl import SFTTrainer

# Config
model_id = "unsloth/llama-3-8b-Instruct-bnb-4bit" # Or any Llama-3/3.2 base model
dataset_path = "dataset.jsonl"
output_dir = "./nepal_law_model"

# BitsAndBytes config for QLoRA
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
)

# Load model and tokenizer
print(f"Loading base model: {model_id}...")
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    quantization_config=bnb_config,
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained(model_id)
tokenizer.pad_token = tokenizer.eos_token

# LoRA config
lora_config = LoraConfig(
    r=8,
    lora_alpha=16,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

# Load Dataset
print(f"Loading training dataset from {dataset_path}...")
dataset = load_dataset("json", data_files=dataset_path, split="train")

# Training Arguments
training_args = TrainingArguments(
    output_dir=output_dir,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    logging_steps=10,
    max_steps=60,
    optim="paged_adamw_8bit",
    fp16=True,
    warmup_ratio=0.03,
    lr_scheduler_type="constant"
)

# SFT Trainer
trainer = SFTTrainer(
    model=model,
    train_dataset=dataset,
    peft_config=lora_config,
    max_seq_length=512,
    tokenizer=tokenizer,
    args=training_args,
    dataset_text_field="text",
)

print("Starting QLoRA fine-tuning training...")
trainer.train()

# Save adapter
adapter_dir = os.path.join(output_dir, "adapter")
trainer.model.save_pretrained(adapter_dir)
print(f"Fine-tuning completed! LoRA adapter saved to {adapter_dir}")